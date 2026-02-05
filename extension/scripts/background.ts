/**
 * Service worker for MoneyGuard extension.
 */

import {SupabaseUser,Client,addTransactions,updateSavings, getProfile, getUser} from '../modules/supabase-module.ts';
import { Item, MsgRequest, requestTypes } from '../shared/types.ts';
import { SupabaseClient } from '@supabase/supabase-js';

chrome.runtime.onInstalled.addListener(() => {
  console.log('MoneyGuard Extension Installed');
});

chrome.runtime.onMessage.addListener(
  function(request:MsgRequest, sender, sendResponse) {
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
      const user:SupabaseUser = request.user
      const client:Client = request.client
      addTransactions(user,client,data).then(_ => {
        sendResponse({
          success: true,
        });
      }).catch(_=>{
        sendResponse({
          success: false,
        });
      })
    }else if (request.type === requestTypes.updateSaving) {
      const amount:number = request.amount
      const user:SupabaseUser = request.user
      const client:Client = request.client
      updateSavings(user,client,amount).then(_ => {
        sendResponse({
          success: true,
        });
      }).catch(_=>{
        sendResponse({
          success: false,
        });
      })
    }else if (request.type === requestTypes.getUser) {
      getUser().then(user => {
        if (user.user) {
          sendResponse({
            success: true,
            user: user
          });
        }else {
          sendResponse({
            success: false,
          });
        }
      }).catch(_=>{
        sendResponse({
          success: false,
        });
      })
    }else if (request.type === requestTypes.getProfile) {
      const user:SupabaseUser = request.user
      const client:SupabaseClient = request.client
      getProfile(user,client)
        .then(profile => {
          sendResponse({
            success: true,
            profile:profile
          });
        })
        .catch(_=>{
        sendResponse({
          success: false,
        });
      })
    }
  }
);
