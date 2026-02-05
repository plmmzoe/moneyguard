
export async function analyzePageText(text: string,userContext:string) {
  return await llmAnalyze(text,userContext);
}
async function llmAnalyze(text: string, userContext:string) {
  const apikey= import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!apikey) {
    throw new Error('No api key provided.');
  }
  const gemini_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
  const msg = `
      Important, do not include any extra text, formatting or whitespace or linebreaks other than the formats provided : 
      Generate a response in a json format of 
      {items:list of item from part 2, analysis:brief <50 word analysis of items from part 2 about the financial impact of this purchase on the user}
      Part 1:
      Below is the json format of a user's profile details:
      ${userContext}
      Part 2:
      Lastly, given the body text of an online shopping page, parse out the items in the shopping cart along with their prices.
      Format the items in an array of json formatted like the following {name:item-name,price:item-price-number,quantity:item-quantity}.
      if there are no valid items, return only [].
      Below is the shopping page text:
      ${text}
    `;
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

