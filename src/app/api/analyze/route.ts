import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Fetch user profile/hobbies
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userContext = '';
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('hobbies')
        .eq('user_id', user.id)
        .single();

      if (profile?.hobbies && Array.isArray(profile.hobbies) && profile.hobbies.length > 0) {
        const hobbiesList = profile.hobbies.map((h: any) => `${h.name} (Inv: ${h.rating}/10)`).join(', ');
        userContext = `User's Hobbies & Interests: ${hobbiesList}.`;
      }
    }

    const prompt = `
      You are a financial advisor helping a user decide if they should buy an item.
      ${userContext}
      Analyze the following potential purchase for impulsive spending:
      
      Item: ${item}
      Price: ${price}
      Description/Reason for buying: ${description || 'No description provided'}
      
      If the user has hobbies listed, explicitly check if this item aligns with them (e.g., if a high-rated hobby justifies the cost).
      
      Provide a concise analysis. 
      1. Is this likely an impulsive buy? (Yes/No/Maybe)
      2. Pros of buying (Relate to hobbies if applicable).
      3. Cons of buying.
      4. A witty recommendation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ analysis: text });
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
