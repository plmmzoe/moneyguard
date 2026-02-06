import {
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Wallet,
  Hourglass,
  Shuffle,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Schema for the unified AI purchase analysis response (web display)
export interface AnalysisResultData {
  aiVerdict: 'likely_impulsive' | 'borderline' | 'considered';
  confidence: 'low' | 'medium' | 'high';
  impulseScore: number;
  regretRisk?: 'low' | 'medium' | 'high';
  financialImpact?: {
    percentOfMonthlyBudget?: number;
    savingsImpact?: string;
  };
  keyReasons?: { type?: string; explanation: string }[];
  coolOff?: {
    recommended?: boolean;
    delay?: string;
    reflectionPrompt?: string;
  };
  suggestedAlternatives?: { type?: string; suggestion: string }[];
  shortExplanation?: string;
}

/** Normalize API response to AnalysisResultData (handles both new and legacy shapes). */
export function normalizeAnalysisResponse(raw: unknown): AnalysisResultData {
  const r = raw as Record<string, unknown>;
  const hasNewSchema = typeof r?.aiVerdict === 'string';
  if (hasNewSchema) {
    return {
      aiVerdict: r.aiVerdict as AnalysisResultData['aiVerdict'],
      confidence: (r.confidence as AnalysisResultData['confidence']) ?? 'medium',
      impulseScore: Number(r.impulseScore) ?? 0,
      regretRisk: r.regretRisk as AnalysisResultData['regretRisk'],
      financialImpact: r.financialImpact as AnalysisResultData['financialImpact'],
      keyReasons: (r.keyReasons as AnalysisResultData['keyReasons']) ?? [],
      coolOff: r.coolOff as AnalysisResultData['coolOff'],
      suggestedAlternatives: (r.suggestedAlternatives as AnalysisResultData['suggestedAlternatives']) ?? [],
      shortExplanation: r.shortExplanation as string | undefined,
    };
  }
  // Legacy shape: verdict, summary, keyReasons, coolOffSuggestion, alternatives, usageRealityCheck
  const verdict = (r.verdict ?? r.overallVerdict) as string | undefined;
  const coolOffSuggestion = r.coolOffSuggestion as { recommendedDelay?: string; reflectionPrompt?: string } | undefined;
  const hasCoolOff = coolOffSuggestion?.recommendedDelay && coolOffSuggestion.recommendedDelay !== 'none';
  return {
    aiVerdict: (verdict === 'likely_impulsive' || verdict === 'borderline' || verdict === 'considered' ? verdict : 'borderline') as AnalysisResultData['aiVerdict'],
    confidence: ((r.usageRealityCheck as { confidenceLevel?: string })?.confidenceLevel as 'low' | 'medium' | 'high') ?? 'medium',
    impulseScore: Number(r.impulseScore) ?? 0,
    regretRisk: r.regretRisk as AnalysisResultData['regretRisk'],
    financialImpact: r.financialImpact as AnalysisResultData['financialImpact'],
    keyReasons: (r.keyReasons as AnalysisResultData['keyReasons']) ?? [],
    coolOff: hasCoolOff ? { recommended: true, delay: coolOffSuggestion?.recommendedDelay, reflectionPrompt: coolOffSuggestion?.reflectionPrompt } : undefined,
    suggestedAlternatives: (r.alternatives ?? r.suggestedAlternatives) as AnalysisResultData['suggestedAlternatives'],
    shortExplanation: (r.summary ?? r.shortExplanation) as string | undefined,
  };
}

interface AnalysisResultProps {
  result: AnalysisResultData;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const {
    aiVerdict,
    confidence,
    impulseScore,
    financialImpact,
    keyReasons = [],
    coolOff,
    suggestedAlternatives = [],
    shortExplanation,
  } = result;

  const displayReasons = keyReasons.slice(0, 3);
  const percentOfBudget = financialImpact?.percentOfMonthlyBudget;
  const savingsImpact = financialImpact?.savingsImpact;
  const showCoolOff = coolOff?.recommended && (coolOff.delay || coolOff.reflectionPrompt);
  const isLowConfidence = confidence === 'low';

  const getVerdictStyle = (v: string) => {
    switch (v?.toLowerCase()) {
      case 'likely_impulsive':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: <AlertOctagon className="h-10 w-10 text-amber-600" />,
          label: 'Pause suggested',
        };
      case 'borderline':
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          icon: <AlertTriangle className="h-10 w-10 text-slate-600" />,
          label: 'Proceed with care',
        };
      case 'considered':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          icon: <CheckCircle className="h-10 w-10 text-emerald-600" />,
          label: 'Looks reasonable',
        };
      default:
        return {
          bg: 'bg-primary/5',
          border: 'border-border',
          text: 'text-primary',
          icon: <Sparkles className="h-10 w-10 text-primary" />,
          label: 'Analysis complete',
        };
    }
  };

  const verdictStyles = getVerdictStyle(aiVerdict);

  const getScoreColor = (score: number) => {
    if (score < 30) {return 'text-emerald-600';}
    if (score < 70) {return 'text-amber-600';}
    return 'text-amber-700';
  };

  const getConfidenceLabel = (c: string) => {
    switch (c) {
      case 'high': return 'High confidence';
      case 'medium': return 'Medium confidence';
      default: return 'Low confidence';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Verdict summary — aiVerdict + confidence (primary) */}
      <Card className={`border-2 ${verdictStyles.border} ${verdictStyles.bg}`}>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-0.5">{verdictStyles.icon}</div>
              <div>
                <h2 className={`text-xl font-semibold ${verdictStyles.text}`}>
                  {verdictStyles.label}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {getConfidenceLabel(confidence)}
                </p>
                {isLowConfidence && (
                  <p className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    Based on limited information
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(impulseScore)}`}>
                  {impulseScore}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                  Impulse score
                </div>
              </div>
            </div>
          </div>
          {shortExplanation && (
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-4">
              {shortExplanation}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 2. Financial impact — budget %, savings impact */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            Financial impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {percentOfBudget != null && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Of monthly budget
                </div>
                <div className="text-2xl font-semibold">{percentOfBudget}%</div>
              </div>
            )}
            {savingsImpact && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Savings impact
                </div>
                <p className="text-sm text-foreground">{savingsImpact}</p>
              </div>
            )}
          </div>
          {percentOfBudget == null && !savingsImpact && (
            <p className="text-sm text-muted-foreground">No budget or savings context provided.</p>
          )}
        </CardContent>
      </Card>

      {/* 3. Why this verdict — keyReasons (max 3 bullets) */}
      {displayReasons.length > 0 && (
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Why this verdict</CardTitle>
            <CardDescription>Factors that shaped the analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {displayReasons.map((reason, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <div>
                    {reason.type && (
                      <span className="text-xs font-medium text-muted-foreground capitalize block mb-0.5">
                        {reason.type}
                      </span>
                    )}
                    <span className="text-sm text-foreground">{reason.explanation}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 4. Cool-off suggestion (if recommended) */}
      {showCoolOff && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-primary" />
              Cool-off suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {coolOff.delay && (
              <p className="text-sm font-medium">
                Consider waiting: <span className="text-primary">{coolOff.delay}</span>
              </p>
            )}
            {coolOff.reflectionPrompt && (
              <p className="text-sm text-muted-foreground">{coolOff.reflectionPrompt}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. Alternatives — optional, collapsible */}
      {suggestedAlternatives.length > 0 && (
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-muted-foreground" />
              Alternatives
            </CardTitle>
            <CardDescription>Other options you might consider</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {suggestedAlternatives.map((alt, i) => (
                <AccordionItem key={i} value={`alt-${i}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="flex items-center gap-2">
                      {alt.type && (
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded capitalize">
                          {alt.type}
                        </span>
                      )}
                      <span className="text-sm font-medium">View suggestion</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    {alt.suggestion}
                    <button
                      type="button"
                      className="mt-2 text-xs font-medium text-primary flex items-center gap-1 hover:underline"
                    >
                      Explore this option <ArrowRight className="h-3 w-3" />
                    </button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
