
async function analyzePageText(text: string) {
  const apikey = ''
  return await llmAnalyze(text, apikey)
}
async function llmAnalyze(text: string, apikey:string) {
  const gemini_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
  const msg = 'Given the body text of an online shopping page, parse out the items in the shopping cart along with their prices. Format the output in the following way (item name,price, quantity) : '
  const body ={
    contents:[{
      parts: [{
        text:msg + text
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

function detectPurchaseIntent() {
  if (hasPrompted) return;

  const textContent = document.body.innerText.toLowerCase();
  analyzePageText(textContent).then(r => {
    console.log(r)
    console.log(r.candidates[0].content.parts[0].text);
  }).catch(err => {
    console.error(err)
  });
}