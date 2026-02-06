
export const generatePurchaseAnalysisPrompt = (
  userContext: string,
  item: string,
  price: string | number,
  description?: string,
) => `
      You are an AI purchase decision analyst.
      ${userContext}
      You will receive a JSON object describing a user's intended purchase.

      Your task is to analyze whether this purchase is impulsive, unnecessary, or misaligned with the user's actual needs.

      Rules:
      - Base your reasoning strictly on the provided data.
      - Be neutral, supportive, and analytical.
      - Do not shame or judge the user.
      - Do not recommend buying unless strong justification exists.

      User Data:
      Item: ${item}
      Price: ${price}
      Description/Reason for buying: ${description || 'No description provided'}
      
      Return your response in the following JSON format:

      {
        "overallVerdict": "likely_impulsive | borderline | considered",
        "impulseScore": 0-100,
        "regretRisk": "low | medium | high",
        "keyReasons": [
          {
            "type": "emotion | usage | redundancy | financial | timing",
            "explanation": "..."
          }
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
          "recommendedDelay": "24h | 72h | 7d | none",
          "reflectionPrompt": "..."
        },
        "alternatives": [
          {
            "type": "cheaper | delay | use_existing | rent | skip",
            "suggestion": "..."
          }
        ],
        "finalAdvice": "..."
      }
    `;

export const generateExtensionAnalysisPrompt = (userContext: string, pageText: string) => `
      Important, do not include any extra text, formatting or whitespace or linebreaks other than the formats provided.
      
      Your task is to:
      1. Parse the online shopping page text to identify items in the shopping cart/checkout.
      2. Perform a financial impact analysis on these items based on the user's profile.

      Part 1: User Profile
      ${userContext}

      Part 2: Shopping Page Text
      ${pageText}

      Output Requirements:
      Generate a valid JSON response with this structure:
      {
        "items": [
          { "name": "item name", "price": number, "quantity": number }
        ],
        "analysis": "A concise (under 50 words) analysis of the financial impact and necessity of this purchase, considering the user's profile. Be neutral and analytical."
      }

      If no valid items are found, return items as [].
    `;

export const generateInsightAnalysisPrompt = (start: string, end: string, transactions: string) => `
      Analyze the following user's transactions between ${start} and ${end}. 
      Utilize the transactions' description, amount, and created_at date to identify spending trends, likely impulse purchases, and to suggest three actionable recommendations to help correct any irregular spending habits found in the analysis. 
      
      Return JSON with keys: summary, impulseCandidates, recommendations. 
      Return your response in a single key value pair in your json response such as { response: "Your entire written response here of multiple paragraphs, include any newline special characters to separate paragraphs" }. 
      
      Transactions: ${transactions}
    `;
