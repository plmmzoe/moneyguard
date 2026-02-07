
function generateExtensionAnalysisPrompt(
  userProfile: string,
  pageContext: string,
): string {
  const sections: string[] = [];

  // --- System preamble ---
  sections.push(`You are an AI purchase-decision analyst for the app "MoneyGuard".

RULES — follow strictly:
- Base reasoning ONLY on the data provided below.
- Fields may be missing. Missing data means UNKNOWN — never assume negative intent.
- Be neutral, supportive, and analytical. Never shame or judge.
- Prefer conservative judgments when data is incomplete.
- Do not recommend buying unless strong justification exists.
- Return ONLY the JSON object described at the end — no extra text.`);

  sections.push(`User Context:${userProfile}`);
  sections.push(`Purchase Context:${pageContext}`);

  // --- Output schema (aligned with transactions: verdict, transaction_state, analysis) ---
  sections.push(`RESPONSE FORMAT — return exactly this JSON structure:
{
  "items": [
    { "name": "string", "price": number, "quantity": number, "currency": "string" }
  ],
  "verdict": "high | medium | low",
  "analysis": "Single plain-English paragraph to store in the database: summary of the analysis, key factors, and recommendation.",
  "impulseScore": 0-100,
  "summary": "1-2 sentence plain-English summary for the UI.",
  "keyReasons": [
    { "type": "emotion | usage | redundancy | financial | timing", "explanation": "..." }
  ],
  "usageRealityCheck": {
    "predictedFrequency": "...",
    "confidenceLevel": "high | medium | low",
    "why": "..."
  },
  "opportunityCost": {
    "whatItDisplaces": "...",
    "whyItMatters": "..."
  },
  "coolOffSuggestion": {
    "recommendedDelay": "none | 24h | 72h | 7d",
    "reflectionPrompt": "..."
  },
  "alternatives": [
    { "type": "cheaper | delay | use_existing | rent | skip", "suggestion": "..." }
  ]
}

Rules for "items":
- For extension input with pageContext, parse items from the page text.
- If no items can be identified, return items as [].

Rules for "verdict" (impulse/regret risk — maps to transactions.verdict):
- "high" = likely impulsive, high regret risk; suggest pausing or cool-off.
- "medium" = borderline; proceed with care.
- "low" = considered purchase, lower regret risk.

`);

  return sections.join('\n\n---\n\n');
}

export async function analyzePageText(text: string, userContext:string) {
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

