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
  prevTab:"PREV_TAB",
}

function parseItem(text: string) : LlmResponse| undefined {
  try{
    return JSON.parse(text);
  }catch(error){
    console.error(error);
  }
}

function analyze(){
  console.log("firing")
  getUser(
    function(resp:MsgResp) {
      proceedWithUser(resp.user);
    },function(){
      console.error("Error getting user");
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
      console.log(resp)
      success(resp)
    }else{
      console.error("Failed to get user");
      failure()
    }
  })
}

function proceedWithUser(userID:string){
  const textContent = document.body.innerText.toLowerCase();
  getProfile(userID,
    function(profile:any) {
      console.log("profile")
      console.log(profile)
      proceedWithProfile(userID,profile,textContent)
    },
    function(){
      console.error("Error getting profile");
    })
}
function getProfile(userID:string,success:(x:any)=>void,failure:()=>void) : void {
  const msg:MsgRequest = {
    type: requestTypes.getProfile,
    user:userID
  }
  chrome.runtime.sendMessage(msg,function(resp){
    if (resp.success){
      console.log("Successfully got profile");
      console.log(resp)
      success(resp.profile)
    }else{
      console.error("Failed to get profile");
      failure()
    }
  })
}

function proceedWithProfile(userID:string,profile:any,textContent:string){
  console.log("user data retrieved")
  const permissionUI = showPermissionUI(()=>{
    const loadingScreen = loadingUI();
    const userContext = JSON.stringify(profile)
    document.body.appendChild(loadingScreen);
    analyzePageText(textContent,userContext).then(r => {
      console.log(r)
      const txt = r.candidates[0].content.parts[0].text;
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
            chrome.runtime.sendMessage({type:requestTypes.prevTab})
          },
          function(){
            console.error("saving logging failed")
          })
        loadingScreen.remove();
        document.body.appendChild(analysisUI(userID,items,profile,boundPurchase,boundSave));
      } else {
        console.log(txt)
        console.error("Gemini Response Corruption")
      }
    }).catch(_ => {
      loadingScreen.remove()
      console.error("error populating analysis")
    });
  });
  document.body.appendChild(permissionUI);
}

function purchase(success:()=>void,failure:()=>void,user:any,items: Item[]) : void {
  const msg:MsgRequest = {
    type: requestTypes.addTransaction,
    items:items,
    user:user,
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

function save(success:()=>void,failure:()=>void,user:any,items: Item[]) : void {
  let savings = 0;
  for (const item of items) {
    savings += item.price * item.quantity;
  }
  const msg:MsgRequest = {
    type: requestTypes.updateSaving,
    amount:savings,
    user:user,
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