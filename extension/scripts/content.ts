import { detectPurchaseIntent } from './detect';
import { showPermissionUI } from '../UIs/permissionUI.ts';
import {analysisUI} from '../UIs/analysisUI.ts';
import {LlmResponse,Item} from '../shared/types.ts';
import { analyzePageText } from './gemini.ts';
import { loadingUI } from '../UIs/loadingUI.ts';
import { createExtensionSupabaseClient } from './supabase-extension.ts';
import { createAuthApi } from 'shared/auth';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { TransactionData } from '../../src/lib/dashboard.type.ts';

function parseItem(text: string) : LlmResponse| undefined {
  try{
    return JSON.parse(text);
  }catch(error){
    console.error(error);
  }
}

function purchase(user:User,client:SupabaseClient,items: Item[]) : void {
  addTransactions(user,client,items).then(_=>{
    console.log("transaction added")
  }).catch(_=>{
    console.error("Transaction update failed");
  });
}

function save(user:User,client:SupabaseClient,items: Item[]) : void {
  let savings = 0;
  for (const item of items) {
    savings += item.price * item.quantity;
  }
  updateSavings(user,client,savings).then(()=>{
    console.log("savings updated")
  }).catch(_=>{
    console.error("saving update failed")
  })
}

async function getUser(){
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    throw new Error('Extension not configured. Build with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const client = await createExtensionSupabaseClient(url,anonKey);
  const auth = createAuthApi(client);
  const sessionUser = await auth.getUser();
  return {user:sessionUser, client:client};
}

async function getProfile(sessionUser:User|null, client:SupabaseClient)  {
  let userContext = '';
  if (sessionUser) {
    const { data: profile } = await client
      .from('profiles')
      .select()
      .eq('user_id', sessionUser.id)
      .single();

    if (profile) {
      userContext = JSON.stringify(profile);
    }
  }
  return userContext;
}

async function updateSavings(sessionUser:User, client:SupabaseClient, amount:number){
  // @ts-ignore
  const {data,error} = await client
    .rpc('increment', { x: amount, row_id: sessionUser.id });
  if (error){
    throw new Error(`Error posting transaction: ${error.message}`);
  }
}

async function addTransactions(sessionUser:User, client:SupabaseClient, items: Item[]) {
  const current = new Date();
  const transactionItems = items.map((item:Item) : TransactionData => {
    return {
      amount: item.quantity * item.price,
      created_at: current.toISOString(),
      transaction_description: item.name,
      user_id: sessionUser.id
    }
  })
  // @ts-ignore
  const {data,error} = await client
    .from('transactions')
    .insert(transactionItems)

  if (error){
    throw new Error(`Error posting transaction: ${error.message}`);
  }
}

function analyze(){
  getUser().then(userObj => {
    const textContent = document.body.innerText.toLowerCase();
    getProfile(userObj.user,userObj.client).then((profile)=>{
      const permissionUI = showPermissionUI(()=>{
        const loadingScreen = loadingUI();
        document.body.appendChild(loadingScreen);
        analyzePageText(textContent,profile).then(r => {
          console.log(r)
          const txt = '';
          const items = parseItem(txt);
          if (items){
            loadingScreen.remove();
            document.body.appendChild(analysisUI(userObj.user,userObj.client,items,purchase,save));
          } else {
            console.log(txt)
            console.error("Gemini Response Corruption")
          }
        }).catch(_ => {
          console.error("error populating analysis")
        });
      });
      document.body.appendChild(permissionUI);
    }).catch(_ => {
      console.error("error getting profile")
    });
  }).catch(_=>{
    console.error("Error getting user");
  })
}

// Run detection on load and mutations
detectPurchaseIntent(analyze);

const observer = new MutationObserver(() => {
    detectPurchaseIntent(analyze);
});

observer.observe(document.body, { childList: true, subtree: true });

// Delayed check in case of single-page apps
setTimeout(() => {
    detectPurchaseIntent(analyze);
}, 5000);