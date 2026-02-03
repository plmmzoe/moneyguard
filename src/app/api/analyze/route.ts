import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Note: GEMINI_API_KEY must be set. Do not hardcode in client-side code.
const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in the environment variables.' },
        { status: 500 },
      );
    }

    const { item, price, description } = await request.json();

    if (!item || !price) {
      return NextResponse.json(
        { error: 'Item name and price are required.' },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      You are an AI purchase decision analyst.

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const is429 =
      message.includes('429') ||
      message.includes('Too Many Requests') ||
      message.includes('quota') ||
      message.includes('Quota exceeded');

    if (is429) {
      console.error('Gemini API quota/rate limit:', error);
      return NextResponse.json(
        {
          error:
            'Gemini API quota exceeded or rate limited. Check your plan at https://ai.google.dev/gemini-api/docs/rate-limits or try again in a minute.',
        },
        { status: 429 },
      );
    }

    console.error('Error analyzing spending:', error);
    return NextResponse.json(
      { error: 'Failed to analyze spending.' },
      { status: 500 },
    );
  }
}
