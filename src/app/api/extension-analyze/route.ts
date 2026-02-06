import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';
// Note: GEMINI_API_KEY must be set. Do not hardcode in client-side code.
const apiKey = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3-flash-preview';

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in the environment variables.' },
        { status: 500 },
      );
    }

    const { pageTxt } = await request.json();

    if (!pageTxt) {
      return NextResponse.json(
        { error: 'text is required.' },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: { responseMimeType: 'application/json' },
    });

    // Fetch user profile/hobbies
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userContext = '';
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', user.id)
        .single();

      if (profile) {
        userContext = JSON.stringify(profile);
      }
    }

    const prompt = `
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
      ${pageTxt}
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
