import { detectPurchaseIntent } from './detect';
import { showPermissionUI } from '../UIs/permissionUI.ts';
import {analysisUI} from '../UIs/analysisUI.ts';
import { analyzePageText } from './gemini.ts';
import { loadingUI } from '../UIs/loadingUI.ts';

type Item = {
  name: string,
  price:number,
  quantity:number,
}

type LlmResponse = {
  items: Item[],
  analysis: string,
}

type MsgRequest = {
  type: string,
  [key:string]:any,
}

type MsgResp = {
  success: boolean,
  [key:string]:any,
}

const requestTypes = {
  openAnalysis:"OPEN_ANALYSIS",
  addTransaction:"ADD_TRANSACTION",
  updateSaving:"UPDATE_SAVINGS",
  getProfile:"GET_PROFILE",
  getUser:"GET_USER",
}

type UserObj={user:any,client:any}

function parseItem(text: string) : LlmResponse| undefined {
  try{
    return JSON.parse(text);
  }catch(error){
    console.error(error);
  }
}

function purchase(success:()=>void,failure:()=>void,user:any,client:any,items: Item[]) : void {
  const msg:MsgRequest = {
    type: requestTypes.addTransaction,
    items:items,
    user:user,
    client:client,
  }
  chrome.runtime.sendMessage(msg,function(resp){
    if (resp.success){
      console.log("Successfully purchased transaction");
      success()
    }else{
      console.error("Failed to purchase transaction");
      failure()
    }
  });
}

function save(success:()=>void,failure:()=>void,user:any,client:any,items: Item[]) : void {
  let savings = 0;
  for (const item of items) {
    savings += item.price * item.quantity;
  }
  const msg:MsgRequest = {
    type: requestTypes.addTransaction,
    amount:savings,
    user:user,
    client:client,
  }
  chrome.runtime.sendMessage(msg,function(resp){
    if (resp.success){
      console.log("Successfully updated savings");
      success()
    }else{
      console.error("Failed to update savings");
      failure()
    }
  })
}

function getUser(success:(x:any)=>void,failure:()=>void) : void {
  const msg:MsgRequest = {
    type: requestTypes.getUser
  }
  chrome.runtime.sendMessage(msg,function(resp:MsgResp){
    console.log(resp)
    if (resp.success){
      console.log("Successfully got user");
      success(resp.user)
    }else{
      console.error("Failed to get user");
      failure()
    }
  })
}

function getProfile(userObj:UserObj,success:(x:any)=>void,failure:()=>void) : void {
  const msg:MsgRequest = {
    type: requestTypes.getProfile,
    user:userObj.user,
    client:userObj.client
  }
  chrome.runtime.sendMessage(msg,function(resp){
    if (resp.success){
      console.log("Successfully got user");
      success(resp.user)
    }else{
      console.error("Failed to get user");
      failure()
    }
  })
}

function proceedWithProfile(userObj:UserObj,profile:string,textContent:string){
  const permissionUI = showPermissionUI(()=>{
    const loadingScreen = loadingUI();
    document.body.appendChild(loadingScreen);
    analyzePageText(textContent,profile).then(r => {
      console.log(r)
      const txt = '';
      const items = parseItem(txt);
      if (items){
        const boundPurchase = purchase.bind(null,
          function(){
          console.log("Purchase logged");
          },
          function(){
          console.error("purchase logging failed")
          })
        const boundSave = save.bind(null,
          function(){
            console.log("saving logged");
          },
          function(){
            console.error("saving logging failed")
          })
        loadingScreen.remove();
        document.body.appendChild(analysisUI(userObj.user,userObj.client,items,boundPurchase,boundSave));
      } else {
        console.log(txt)
        console.error("Gemini Response Corruption")
      }
    }).catch(_ => {
      console.error("error populating analysis")
    });
  });
  document.body.appendChild(permissionUI);
}

function proceedWithUser(userObj:UserObj){
  const textContent = document.body.innerText.toLowerCase();
  getProfile(userObj,
    function(resp:MsgResp) {
      if (resp.success){
        proceedWithProfile(userObj,resp.profile,textContent)
      }else{
        console.error("Error getting profile]");
      }
    },function(){
      console.error("Error getting profile");
    })
}

function analyze(){
  getUser(
    function(resp:MsgResp) {
      if (resp.success){
        proceedWithUser(resp.user);
      }else{
        console.error("Error getting user");
      }
    },function(){
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