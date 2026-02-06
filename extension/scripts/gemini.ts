
import { generateExtensionAnalysisPrompt } from 'shared/prompts';

export async function analyzePageText(text: string,userContext:string) {
  return await llmAnalyze(text,userContext);
}
async function llmAnalyze(text: string, userContext:string) {
  // @ts-ignore
  const apikey= import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apikey) {
    throw new Error('No api key provided.');
  }
  const gemini_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
  const msg = generateExtensionAnalysisPrompt(userContext, text);
  const body ={
    contents:[{
      parts: [{
        text:msg
      }]
    }]
  }
  return await fetch(gemini_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apikey,
    },
    body: JSON.stringify(body)
  }).then(r => {
    if (r.ok) {
      return r.json();
    }
  }).catch(err => {
    console.log(err)
  })
}

