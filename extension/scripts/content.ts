import { detectPurchaseIntent } from './detect';
import { showPermissionUI } from '../UIs/permissionUI.ts';
import { analysisUI } from '../UIs/analysisUI.ts';
import { analyzePageText } from './gemini.ts';
import { loadingUI } from '../UIs/loadingUI.ts';
import { toastUI } from '../UIs/toastUI.ts';
import type { LlmResponse,MsgRequest,Item,MsgResp,TransactionState,TransactionDetails } from '../shared/types';

function parseItem(text: string): LlmResponse | undefined {
  try{
    return JSON.parse(text);
  }catch(error){
    console.error(error);
  }
}

function warningToast(msg:string){
  const toast = toastUI(msg);
  document.body.appendChild(toast);
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
    type: "GET_USER"
  }
  chrome.runtime.sendMessage(msg,function(resp:MsgResp){
    console.log(resp)
    if (resp.success){
      console.log("Successfully got user");
      success(resp)
    } else {
      warningToast("Login to enable more features.");
      console.error("Failed to get user; proceeding without account (no budget, no save).");
      failure()
    }
  })
}

function proceedWithUser(userID:string){
  const textContent = document.body.innerText.toLowerCase();
  getProfile(userID,
    function(profile:any) {
      proceedWithProfile(userID, profile, textContent)
    },
    function(){
      console.error("Error getting profile; proceeding with no profile.");
      proceedWithProfile(userID, null, textContent)
    })
}
function getProfile(userID:string,success:(x:any)=>void,failure:()=>void) : void {
  const msg:MsgRequest = {
    type: "GET_PROFILE",
    user:userID
  }
  chrome.runtime.sendMessage(msg,function(resp){
    if (resp.success){
      console.log("Successfully got profile");
      console.log(resp)
      success(resp.profile)
    }else{
      warningToast("MoneyTracker profile error")
      console.error("Failed to get profile");
      failure()
    }
  })
}

function proceedWithProfile(userID:string | null, profile:any, textContent:string){
  console.log("user data retrieved", userID ? "with user" : "without user")
  const permissionUI = showPermissionUI(()=>{
    const loadingScreen = loadingUI();
    const userContext = JSON.stringify(profile ?? null)
    document.body.appendChild(loadingScreen);
    analyzePageText(textContent,userContext).then(r => {
      console.log(r)
      const txt = r.candidates[0].content.parts[0].text;
      const items = parseItem(txt);
      if (items){
        console.log(items)
        const cost = items.items.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0);
        const transactionDescription = items.items.length
          ? items.items.map((i: Item) => i.name).join(', ')
          : 'Cart';
        let payload:Partial<TransactionDetails> = {
          transaction_description: transactionDescription,
          amount: cost,
          analysis: items.analysis ?? '',
          verdict: items.verdict ?? null,
        };
        if (!userID) {
          loadingScreen.remove();
          const onDecisionNoUser = () => {
            warningToast("Sign in to enable more features.");
          };
          document.body.appendChild(
            analysisUI('', items as LlmResponse, null, onDecisionNoUser)
          );
          return;
        }
        const onDecision = (state: TransactionState) => {
          const cooloff_expiry = state === 'waiting'
            ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            : undefined;
          payload.user_id = userID;
          payload.transaction_state = state;
          payload.cooloff_expiry = cooloff_expiry;
          const msg:MsgRequest = {
            type: "ADD_TRANSACTION",
            itemDetails: payload as TransactionDetails
          }
          console.log("sending transaction")
          console.log(payload)
          chrome.runtime.sendMessage(msg,
            (updateResp: MsgResp) => {
              if (updateResp?.success) {
                const toast = toastUI('Decision saved to your history.');
                document.body.appendChild(toast);
              } else {
                warningToast('Failed to save decision. Please try again.');
              }
            }
          );
        };
        loadingScreen.remove();
        document.body.appendChild(
          analysisUI(userID, items as LlmResponse, profile, onDecision)
        );
      } else {
        loadingScreen.remove();
        console.log(txt)
        warningToast("Gemini response error")
        console.error("Gemini Response Corruption")
      }
    }).catch(_ => {
      loadingScreen.remove()
      warningToast("Gemini busy, please refresh and try again")
      console.error("error populating analysis")
    });
  });
  document.body.appendChild(permissionUI);
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