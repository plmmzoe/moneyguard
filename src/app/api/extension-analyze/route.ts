import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';
import {
  generateUnifiedPurchaseAnalysisPrompt,
  type UnifiedAnalysisInput,
  type UserProfile,
} from 'shared/prompts';

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

    // Build user profile from DB
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userProfile: UserProfile = {};
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('interests, monthly_budget, currency, savings_goal_reward, savings_goal_amount')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        userProfile.monthlyBudget = profile.monthly_budget ?? undefined;
        userProfile.currency = profile.currency ?? undefined;
        if (profile.savings_goal_reward) {
          userProfile.savingsGoal = {
            name: profile.savings_goal_reward,
            amount: profile.savings_goal_amount ?? undefined,
          };
        }
        if (profile.interests && profile.interests.length > 0) {
          userProfile.interests = profile.interests.join(', ');
        }
      }
    }

    const input: UnifiedAnalysisInput = {
      pageContext: pageTxt,
      userProfile,
    };

    const prompt = generateUnifiedPurchaseAnalysisPrompt(input);

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
