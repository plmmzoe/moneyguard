import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini
// Note: It's important to keep the API key secure. 
// Do not hardcode it in client-side code.
const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in the environment variables.' },
        { status: 500 }
      );
    }

    const { item, price, description } = await request.json();

    if (!item || !price) {
      return NextResponse.json(
        { error: 'Item name and price are required.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      You are a financial advisor helping a user decide if they should buy an item.
      Analyze the following potential purchase for impulsive spending:
      
      Item: ${item}
      Price: ${price}
      Description/Reason for buying: ${description || 'No description provided'}
      
      Provide a concise analysis. 
      1. Is this likely an impulsive buy? (Yes/No/Maybe)
      2. Pros of buying.
      3. Cons of buying.
      4. A witty recommendation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ analysis: text });
  } catch (error) {
    console.error('Error analyzing spending:', error);
    return NextResponse.json(
      { error: 'Failed to analyze spending.' },
      { status: 500 }
    );
  }
}
