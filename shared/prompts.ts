// ────────────────────────────────────────────────────────────────
// Shared types — used by web app, extension, and API routes
// ────────────────────────────────────────────────────────────────

/** A single detected or user-entered item. */
export interface AnalysisItem {
  name: string;
  price: number;
  quantity: number;
  currency?: string;
}

/** Survey answers from the web Quick-Check flow (all optional). */
export interface SurveyAnswers {
  urgency?: string;
  usageFrequency?: string;
  lastNeeded?: string;
  emotionalState?: string;
  thinkingDuration?: string;
  similarItemsOwned?: number;
  reasonOrContext?: string;
}

/** Subset of the user profile relevant to purchase analysis. */
export interface UserProfile {
  monthlyBudget?: number;
  currency?: string;
  savingsGoal?: { name?: string; amount?: number };
  hobbies?: string;
}

/** Input accepted by the unified prompt generator. */
export interface UnifiedAnalysisInput {
  /** Item name (web survey) — may be empty for extension flow. */
  item?: string;
  /** Price string, e.g. "CAD 49.99" (web survey). */
  price?: string | number;
  /** Free-text description / reason for buying. */
  description?: string;
  /** Items parsed from a shopping page (extension flow). */
  detectedItems?: AnalysisItem[];
  /** Raw page text the extension scraped (extension flow). */
  pageContext?: string;
  /** User profile data pulled from the DB. */
  userProfile?: UserProfile;
  /** Structured survey answers (web flow). */
  surveyAnswers?: SurveyAnswers;
}

// ────────────────────────────────────────────────────────────────
// Unified response schema — IDENTICAL for web + extension
// ────────────────────────────────────────────────────────────────

export interface UnifiedAnalysisResponse {
  /** Items that were analyzed (echoed back or parsed from page). */
  items: AnalysisItem[];
  verdict: 'likely_impulsive' | 'borderline' | 'considered';
  /** Suggested DB status the UI can map to. */
  suggestedStatus: 'DRAFT' | 'IN_COOL_OFF' | 'AVOIDED' | 'PURCHASED';
  impulseScore: number;
  regretRisk: 'low' | 'medium' | 'high';
  summary: string;
  keyReasons: { type: string; explanation: string }[];
  usageRealityCheck?: {
    predictedFrequency?: string;
    confidenceLevel?: 'high' | 'medium' | 'low';
    why?: string;
  };
  opportunityCost?: {
    whatItDisplaces?: string;
    whyItMatters?: string;
  };
  coolOffSuggestion?: {
    recommendedDelay?: 'none' | '24h' | '72h' | '7d';
    reflectionPrompt?: string;
  };
  alternatives?: { type: string; suggestion: string }[];
}

// ────────────────────────────────────────────────────────────────
// Unified prompt generator
// ────────────────────────────────────────────────────────────────

export function generateUnifiedPurchaseAnalysisPrompt(
  input: UnifiedAnalysisInput,
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

  // --- User profile ---
  if (input.userProfile) {
    const p = input.userProfile;
    const parts: string[] = [];
    if (p.monthlyBudget != null) {parts.push(`Monthly budget: ${p.currency ?? 'USD'} ${p.monthlyBudget}`);}
    if (p.savingsGoal?.name) {parts.push(`Savings goal: ${p.savingsGoal.name} ($${p.savingsGoal.amount ?? '?'})`);}
    if (p.hobbies) {parts.push(`Hobbies & interests: ${p.hobbies}`);}
    if (parts.length) {
      sections.push(`USER PROFILE:\n${parts.join('\n')}`);
    }
  }

  // --- Purchase target (web survey) ---
  if (input.item) {
    sections.push(`PURCHASE TARGET:\nItem: ${input.item}\nPrice: ${input.price ?? 'unknown'}`);
  }
  if (input.description) {
    sections.push(`REASON / CONTEXT: ${input.description}`);
  }

  // --- Detected items (extension) ---
  if (input.detectedItems && input.detectedItems.length > 0) {
    sections.push(`DETECTED CART ITEMS:\n${JSON.stringify(input.detectedItems)}`);
  }

  // --- Raw page text (extension) ---
  if (input.pageContext) {
    const trimmed = input.pageContext.slice(0, 6000); // keep within token budget
    sections.push(`RAW PAGE TEXT (may contain shopping cart / checkout info):\n${trimmed}`);
  }

  // --- Survey signals (web) ---
  if (input.surveyAnswers) {
    const s = input.surveyAnswers;
    const lines: string[] = [];
    if (s.urgency) {lines.push(`Urgency: ${s.urgency}`);}
    if (s.usageFrequency) {lines.push(`Expected usage: ${s.usageFrequency}`);}
    if (s.lastNeeded) {lines.push(`Last time needed: ${s.lastNeeded}`);}
    if (s.emotionalState) {lines.push(`Current emotional state: ${s.emotionalState}`);}
    if (s.thinkingDuration) {lines.push(`Thinking duration: ${s.thinkingDuration}`);}
    if (s.similarItemsOwned != null) {lines.push(`Similar items already owned: ${s.similarItemsOwned}`);}
    if (s.reasonOrContext) {lines.push(`Reason / alternative: ${s.reasonOrContext}`);}
    if (lines.length) {
      sections.push(`SURVEY SIGNALS:\n${lines.join('\n')}`);
    }
  }

  // --- Output schema ---
  sections.push(`RESPONSE FORMAT — return exactly this JSON structure:
{
  "items": [
    { "name": "string", "price": number, "quantity": number, "currency": "string" }
  ],
  "verdict": "likely_impulsive | borderline | considered",
  "suggestedStatus": "DRAFT | IN_COOL_OFF | AVOIDED | PURCHASED",
  "impulseScore": 0-100,
  "regretRisk": "low | medium | high",
  "summary": "1-2 sentence plain-English summary of the analysis.",
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
- For a web survey, echo back the single item the user entered.
- For extension input with pageContext, parse items from the page text.
- If no items can be identified, return items as [].

Rules for "suggestedStatus":
- "IN_COOL_OFF" when coolOffSuggestion.recommendedDelay is NOT "none".
- "DRAFT" when verdict is "borderline" and no cool-off is recommended.
- "AVOIDED" when verdict is "likely_impulsive" and no cool-off is recommended.
- "DRAFT" for "considered" verdicts (user still decides).`);

  return sections.join('\n\n---\n\n');
}

// ────────────────────────────────────────────────────────────────
// Insight (transaction history) prompt — unchanged
// ────────────────────────────────────────────────────────────────

export const generateInsightAnalysisPrompt = (start: string, end: string, transactions: string) => `
      Analyze the following user's transactions between ${start} and ${end}. 
      Utilize the transactions' description, amount, and created_at date to identify spending trends, likely impulse purchases, and to suggest three actionable recommendations to help correct any irregular spending habits found in the analysis. 
      
      Return JSON with keys: summary, impulseCandidates, recommendations. 
      Return your response in a single key value pair in your json response such as { response: "Your entire written response here of multiple paragraphs, include any newline special characters to separate paragraphs" }. 
      
      Transactions: ${transactions}
    `;
