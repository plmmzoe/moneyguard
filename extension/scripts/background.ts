/**
 * Service worker for MoneyGuard extension.
 */

import {
  addTransactions,
  getProfile,
  getUser,
  updateTransactionState,
} from '../modules/supabase-module.ts';
import { MsgRequest, TransactionDetails } from '../shared/types.ts';

chrome.runtime.onInstalled.addListener(() => {
  console.log('MoneyGuard Extension Installed');
});

const handleGetUser = async (sendResponse:(response:any) => void) => {
  await getUser().then(r=>{
    console.log('got user');
    console.log(r)
    sendResponse({user: r.user,success:true})
  }).catch(err=>{
    console.error("Failed to get user "+err);
    sendResponse({success:false})
  })
}

const handleGetProfile = async (user:string,sendResponse:(response:any) => void) => {
  getProfile(user).then(r=>{
    console.log('got profile');
    console.log(r)
    sendResponse({profile: r,success:true})
  }).catch(err=>{
    console.error("Failed to get profile "+err.toString());
    sendResponse({success:false})
  })
}

const handleAddTransactions = async (itemDetails:TransactionDetails,sendResponse:(response:any) => void) => {
  addTransactions(itemDetails).then(_=>{
    console.log('added transactions');
    sendResponse({success:true})
  }).catch(err=>{
    console.error("Failed to add transactions "+err);
    sendResponse({success:false})
  })
}

const handleUpdateTransactionState = async (
  user: string,
  transactionId: string,
  transaction_state: string,
  cooloff_expiry: string | undefined,
  sendResponse: (response: any) => void
) => {
  updateTransactionState(user, transactionId, transaction_state, cooloff_expiry ?? null)
    .then(() => sendResponse({ success: true }))
    .catch((err) => {
      console.error('Failed to update transaction state', err);
      sendResponse({ success: false });
    });
};

chrome.runtime.onMessage.addListener(
  function(request:MsgRequest, sender, sendResponse) {
    console.log("got message");
    console.log(request);
    console.log(sender.tab ?
      "From a content script:" + sender.tab.url :
      "From the extension"
    );
    if (request.type === "OPEN_ANALYSIS") {
      const { item, price } = request.data;
      const baseUrl = 'http://localhost:3000/analyze';
      const queryParams = new URLSearchParams({
        item: item || '',
        price: price || '',
        auto: 'true' // Flag to possibly auto-trigger or just signal source
      });

      const url = `${baseUrl}?${queryParams.toString()}`;

      // Open in a new popup window
      chrome.windows.create({
        url: url,
        type: 'popup',
        width: 500,
        height: 800
      });
    }else if (request.type === "ADD_TRANSACTION") {
      console.log("add transaction request")
      const data:TransactionDetails = request.itemDetails
      handleAddTransactions(data,sendResponse)
    } else if (request.type === "GET_USER") {
      handleGetUser(sendResponse);
    }else if (request.type === "GET_PROFILE") {
      const user:string = request.user
      handleGetProfile(user,sendResponse)
    } else if (request.type === "PREV_TAB") {
      chrome.tabs.goBack().then(_=>{
        console.log('return tab success');
      }).catch(err=>{
        console.error(err);
      })
    } else if (request.type === "UPDATE_TRANSACTION_STATE") {
      const user = request.user as string;
      const transactionId = request.transactionId as string;
      const transaction_state = request.transaction_state as string;
      const cooloff_expiry = request.cooloff_expiry as string | undefined;
      handleUpdateTransactionState(user, transactionId, transaction_state, cooloff_expiry, sendResponse);
    }
    return true;
  }
);
