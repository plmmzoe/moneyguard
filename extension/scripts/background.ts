/**
 * Service worker for MoneyGuard extension.
 */

import {
  addTransactions,
  updateSavings,
  getProfile,
  getUser,
  createAnalysisTransaction,
  updateTransactionState,
} from '../modules/supabase-module.ts';
import { Item, MsgRequest, requestTypes } from '../shared/types.ts';

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

const handleUpdateSavings = async (user:string,amount:number,sendResponse:(response:any) => void) => {
  updateSavings(user,amount).then(r=>{
    console.log('updated savings');
    console.log(r)
    sendResponse({user: r,success:true})
  }).catch(err=>{
    console.error("Failed to update savings"+err);
    sendResponse({success:false})
  })
}

const handleAddTransactions = async (user:string,items:Item[],sendResponse:(response:any) => void) => {
  addTransactions(user,items).then(r=>{
    console.log('added transactions');
    console.log(r)
    sendResponse({user: r,success:true})
  }).catch(err=>{
    console.error("Failed to add transactions "+err);
    sendResponse({success:false})
  })
}

const handleCreateAnalysisTransaction = async (
  user: string,
  payload: { transaction_description: string; amount: number; analysis: string; verdict?: string | null },
  sendResponse: (response: any) => void
) => {
  createAnalysisTransaction(user, payload)
    .then((transaction_id) => {
      sendResponse({ success: true, transaction_id });
    })
    .catch((err) => {
      console.error('Failed to create analysis transaction', err);
      sendResponse({ success: false });
    });
};

const handleUpdateTransactionState = async (
  user: string,
  transactionId: number,
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
    if (request.type === requestTypes.openAnalysis) {
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
    }else if (request.type === requestTypes.addTransaction) {
      const data:Item[] = request.items
      const user:string = request.user
      handleAddTransactions(user,data,sendResponse)
    }else if (request.type === requestTypes.updateSaving) {
      const amount:number = request.amount
      const user:string = request.user
      handleUpdateSavings(user,amount,sendResponse)
    }else if (request.type === requestTypes.getUser) {
      handleGetUser(sendResponse);
    }else if (request.type === requestTypes.getProfile) {
      const user:string = request.user
      handleGetProfile(user,sendResponse)
    } else if (request.type === requestTypes.prevTab) {
      chrome.tabs.goBack().then(_=>{
        console.log('return tab success');
      }).catch(err=>{
        console.error(err);
      })
    } else if (request.type === requestTypes.createAnalysisTransaction) {
      const user = request.user as string;
      const payload = request.payload as { transaction_description: string; amount: number; analysis: string; verdict?: string | null };
      handleCreateAnalysisTransaction(user, payload, sendResponse);
    } else if (request.type === requestTypes.updateTransactionState) {
      const user = request.user as string;
      const transactionId = request.transactionId as number;
      const transaction_state = request.transaction_state as string;
      const cooloff_expiry = request.cooloff_expiry as string | undefined;
      handleUpdateTransactionState(user, transactionId, transaction_state, cooloff_expiry, sendResponse);
    }
    return true;
  }
);
