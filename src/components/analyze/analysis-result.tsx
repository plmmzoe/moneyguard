import {
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Brain,
  Wallet,
  TrendingDown,
  Clock,
  Scale,
  Calendar,
  Hourglass,
  Shuffle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface AnalysisResultData {
    overallVerdict: 'likely_impulsive' | 'borderline' | 'considered';
    impulseScore: number;
    regretRisk: 'low' | 'medium' | 'high';
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
        recommendedDelay?: string;
        reflectionPrompt?: string;
    };
    alternatives: { type: string; suggestion: string }[];
    finalAdvice: string;
}

interface AnalysisResultProps {
    result: AnalysisResultData;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const {
    overallVerdict,
    impulseScore,
    keyReasons,
    usageRealityCheck = {
      predictedFrequency: 'N/A',
      confidenceLevel: 'low' as const,
      why: 'Not enough data',
    },
    opportunityCost = {
      whatItDisplaces: 'Unknown',
      whyItMatters: 'Not enough data',
    },
    coolOffSuggestion = {
      recommendedDelay: 'none',
      reflectionPrompt: 'No suggestion available',
    },
    alternatives,
    finalAdvice,
  } = result;

  const getVerdictStyle = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'likely_impulsive':
        return {
          bg: 'bg-red-50',
          border: 'border-border',
          text: 'text-red-700',
          icon: <AlertOctagon className="h-12 w-12 text-red-500 mb-2" />,
          label: 'Pause Recommended',
        };
      case 'borderline':
        return {
          bg: 'bg-yellow-50',
          border: 'border-border',
          text: 'text-yellow-700',
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />,
          label: 'Proceed with Caution',
        };
      case 'considered':
        return {
          bg: 'bg-green-50',
          border: 'border-border',
          text: 'text-green-700',
          icon: <CheckCircle className="h-12 w-12 text-green-500 mb-2" />,
          label: 'Green Light',
        };
      default:
        return {
          bg: 'bg-primary/5',
          border: 'border-border',
          text: 'text-primary',
          icon: <Sparkles className="h-12 w-12 text-primary mb-2" />,
          label: 'Analysis Complete',
        };
    }
  };

  const styles = getVerdictStyle(overallVerdict);

  const getScoreColor = (score: number) => {
    if (score < 30) {return 'bg-green-500';}
    if (score < 70) {return 'bg-yellow-500';}
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* SECTION A: HERO */}
      <Card className={`text-center border-2 ${styles.border} ${styles.bg}`}>
        <CardContent className="pt-8 pb-8 flex flex-col items-center">
          {styles.icon}
          <h2 className={`text-2xl font-bold uppercase tracking-wide ${styles.text}`}>
            {styles.label}
          </h2>
          <p className="mt-4 text-xl font-medium italic text-muted-foreground max-w-lg">
                        &quot;{finalAdvice}&quot;
          </p>
        </CardContent>
      </Card>

      {/* SECTION B: LOGIC & SCORE */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Logic Layer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
                            Key Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {keyReasons?.map((reason) => (
                <li key={`${reason.type}-${reason.explanation}`} className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    {reason.type.includes('financial') ? <Wallet className="h-4 w-4 text-muted-foreground" /> :
                      reason.type.includes('usage') ? <TrendingDown className="h-4 w-4 text-muted-foreground" /> :
                        reason.type.includes('timing') ? <Clock className="h-4 w-4 text-muted-foreground" /> :
                          <Sparkles className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <span className="font-medium text-sm capitalize block mb-0.5">{reason.type}</span>
                    <span className="text-sm text-muted-foreground">{reason.explanation}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Score Visual */}
        <Card className="flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="text-center">Impulse Risk Score</CardTitle>
            <CardDescription className="text-center">0 = Safe, 100 = High Risk</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pb-8">
            <div className="relative h-40 w-40 flex items-center justify-center">
              {/* Simple CSS Radial Gauge Simulation */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-muted/20"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * impulseScore) / 100}
                  className={`${getScoreColor(impulseScore)} transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{impulseScore}</span>
                <span className="text-xs uppercase font-semibold text-muted-foreground">/100</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION C: REALITY CHECK */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
                            Usage Reality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Predicted Frequency</div>
              <div className="text-lg font-semibold">{usageRealityCheck?.predictedFrequency || 'N/A'}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${usageRealityCheck?.confidenceLevel === 'high' ? 'bg-green-100 text-green-800' :
                usageRealityCheck?.confidenceLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {usageRealityCheck?.confidenceLevel || 'Low'} Confidence
              </span>
              <span className="text-sm text-muted-foreground">- {usageRealityCheck?.why || 'No explanation provided'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4" />
                            The Trade-Off
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">To buy this, you are effectively trading:</p>
            <div className="p-3 bg-background rounded border font-medium flex items-start gap-3">
              <Wallet className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground">{opportunityCost?.whatItDisplaces || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground mt-1">{opportunityCost?.whyItMatters || 'No details'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION D: ACTION PLAN */}
      <div className="space-y-6">
        {/* Cool-off Challenge */}
        {coolOffSuggestion?.recommendedDelay && coolOffSuggestion.recommendedDelay !== 'none' && (
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Hourglass className="h-5 w-5 text-primary" />
                                The &quot;Cool-Off&quot; Challenge
              </h3>
              <p className="text-muted-foreground max-w-xl">
                {coolOffSuggestion?.reflectionPrompt || 'Take some time to reflect.'}
              </p>
            </div>
            <div className="bg-background px-6 py-3 rounded-lg border shadow-sm font-bold text-lg whitespace-nowrap">
                            Wait {coolOffSuggestion?.recommendedDelay}
            </div>
          </div>
        )}

        {/* Alternatives */}
        {alternatives && alternatives.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Smarter Alternatives</h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {alternatives.map((alt) => (
                <AccordionItem
                  key={`${alt.type}-${alt.suggestion}`}
                  value={`${alt.type}-${alt.suggestion}`}
                >
                  <AccordionTrigger className="capitalize">
                    <span className="flex items-center gap-2">
                      <span className="opacity-70 text-sm font-normal bg-muted px-2 py-0.5 rounded mr-2">{alt.type}</span>
                                            Try this instead?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {alt.suggestion}
                    <div className="mt-3">
                      <button className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
                                                Explore this option <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>

    </div>
  );
}
