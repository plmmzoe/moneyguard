'use client';

import { Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import type { AnalysisResultData } from '@/components/analyze/analysis-result';
import { AnalysisResult } from '@/components/analyze/analysis-result';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/client';

export default function AnalyzePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('survey');
  const isSubmitting = useRef(false);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);

  const [formData, setFormData] = useState({
    // Section 1: Purchase Basics
    itemName: '',
    price: '',
    currency: 'CAD',
    whereToBuy: '',
    urgency: '',

    // Section 2: Utility & Usage
    problemItSolves: '',
    currentAlternative: '',
    expectedUsageFrequency: '',
    lastTimeYouNeededThis: '',
    storageOrMaintenanceConcern: false,

    // Section 3: Emotional & Impulse Signals
    emotionalTrigger: '',
    triggerDescription: '',
    sleepOnItTest: '',
    similarItemsOwned: 0,
    pastRegretOnSimilar: '',

    // Section 4: Financial Context (Fetched from DB)
    // monthlyDisposableBudget: handled by profile.monthly_budget
    // wouldAffectOtherGoals: handled by profile.savings_goal_*
    refundEase: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      if (!supabase) { return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data) { setProfile(data); }
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const canSubmit = formData.itemName && formData.price;

  const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Clear analysis result when form data changes to prevent stale data
  // Clear analysis result when form data changes to prevent stale data
  useEffect(() => {
    setAnalysisResult(null);
  }, [formData]);
  // Note: removed auto-scroll effect as we now switch tabs

  // Auto-scroll to result

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || isSubmitting.current) { return; }

    isSubmitting.current = true;
    setLoading(true);

    try {
      const submissionPayload = {
        item: formData.itemName,
        price: formData.price,
        description: formData.problemItSolves || formData.triggerDescription || 'No description provided',
        financialContext: {
          monthlyBudget: profile?.monthly_budget || 0,
          currency: profile?.currency || 'USD',
          savingsGoal: {
            name: profile?.savings_goal_reward,
            amount: profile?.savings_goal_amount,
          },
        },
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? 'Analysis failed');
      }

      setAnalysisResult(data as AnalysisResultData);
      setActiveTab('result');
    } catch (error) {
      console.error('Analysis error:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze. Please try again.';
      toast({ description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  }

  return (
    <AppLayout>
      <div className="rounded-xl bg-card border border-border p-6 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-10 text-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Quick Check</h1>
          <p className="text-muted-foreground max-w-lg">
            Reflect on a purchase before you buy. Answer a short survey about the item, your budget, and how you feel—then get a clear recommendation on whether it’s worth it for you.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 border border-border">
            <TabsTrigger
              value="survey"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              Survey
            </TabsTrigger>
            <TabsTrigger
              value="result"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              Analysis Result
            </TabsTrigger>
          </TabsList>

          <TabsContent value="survey" className="space-y-6">
            <div className="gap-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* SECTION 1: Purchase Basics */}
                <Card className="border-none shadow-sm bg-card/50">
                  <CardHeader>
                    <CardTitle>The Basics</CardTitle>
                    <CardDescription>What are you looking to buy?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="itemName">Item Name <span className="text-red-500">*</span></Label>
                      <Input id="itemName" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g. Noise Cancelling Headers" required />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                        <div className="flex gap-2">
                          <Select onValueChange={(val) => handleSelectChange('currency', val)} value={formData.currency}>
                            <SelectTrigger className="w-[80px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CAD">CAD</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" className="flex-1" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whereToBuy">Where to Buy?</Label>
                        <Input id="whereToBuy" name="whereToBuy" value={formData.whereToBuy} onChange={handleChange} placeholder="Amazon, Local Store, etc." />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>How urgent is this?</Label>
                      <RadioGroup
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleRadioChange}
                        options={[
                          { value: 'today', label: 'I need it today' },
                          { value: 'this week', label: 'This week' },
                          { value: 'someday', label: 'Someday / No rush' },
                        ]}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* SECTION 2: Utility & Usage */}
                <Card className="border-none shadow-sm bg-card/50">
                  <CardHeader>
                    <CardTitle>Utility & Usage</CardTitle>
                    <CardDescription>How will this fit into your life?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="problemItSolves">What specific problem does this solve?</Label>
                      <Input id="problemItSolves" name="problemItSolves" value={formData.problemItSolves} onChange={handleChange} placeholder="e.g. My current ones are broken..." />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentAlternative">What are you using right now instead?</Label>
                      <Input id="currentAlternative" name="currentAlternative" value={formData.currentAlternative} onChange={handleChange} placeholder="Type 'none' if nothing" />
                    </div>

                    <div className="space-y-3">
                      <Label>How often will you honestly use it?</Label>
                      <RadioGroup
                        name="expectedUsageFrequency"
                        value={formData.expectedUsageFrequency}
                        onChange={handleRadioChange}
                        options={[
                          { value: 'daily', label: 'Daily - Part of my routine' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'monthly', label: 'Monthly' },
                          { value: 'rarely', label: 'Rarely / Special Occasions' },
                        ]}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>When was the last time you actively needed this?</Label>
                      <RadioGroup
                        name="lastTimeYouNeededThis"
                        value={formData.lastTimeYouNeededThis}
                        onChange={handleRadioChange}
                        options={[
                          { value: 'today', label: 'Today' },
                          { value: 'last week', label: 'Last Week' },
                          { value: 'months ago', label: 'Months ago' },
                          { value: 'never', label: 'Never, just thought of it' },
                        ]}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="storageOrMaintenanceConcern"
                        name="storageOrMaintenanceConcern"
                        checked={formData.storageOrMaintenanceConcern}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="storageOrMaintenanceConcern" className="font-normal cursor-pointer">
                      This will require extra storage space or maintenance
                      </Label>
                    </div>

                  </CardContent>
                </Card>

                {/* SECTION 3: Emotional & Impulse Signals */}
                <Card className="border-none shadow-sm bg-card/50">
                  <CardHeader>
                    <CardTitle>Emotional Check</CardTitle>
                    <CardDescription>Understanding the &apos;Why&apos; behind the buy.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="emotionalTrigger">How are you feeling right now?</Label>
                      <Select onValueChange={(val) => handleSelectChange('emotionalTrigger', val)} value={formData.emotionalTrigger}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bored">Bored / Browsing</SelectItem>
                          <SelectItem value="stressed">Stressed / Anxious</SelectItem>
                          <SelectItem value="rewarded">Celebrating / Reward</SelectItem>
                          <SelectItem value="influenced">Influenced (Saw on social media)</SelectItem>
                          <SelectItem value="rational">Calm / Rational</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="triggerDescription">Description (Optional)</Label>
                      <Input id="triggerDescription" name="triggerDescription" value={formData.triggerDescription} onChange={handleChange} placeholder="e.g. Saw a sale email, had a bad day..." />
                    </div>

                    <div className="space-y-3">
                      <Label>Sleep on it: How long have you been thinking about this specific item?</Label>
                      <RadioGroup
                        name="sleepOnItTest"
                        value={formData.sleepOnItTest}
                        onChange={handleRadioChange}
                        options={[
                          { value: 'not yet', label: 'Just saw it now' },
                          { value: '<24h', label: 'Less than 24 hours' },
                          { value: '>48h', label: 'More than 48 hours' },
                          { value: 'weeks', label: 'Weeks or Months' },
                        ]}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="similarItemsOwned">Similar items owned</Label>
                        <Input id="similarItemsOwned" name="similarItemsOwned" type="number" min="0" value={formData.similarItemsOwned} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Have you regretted buying similar items in the past?</Label>
                      <RadioGroup
                        name="pastRegretOnSimilar"
                        value={formData.pastRegretOnSimilar}
                        onChange={handleRadioChange}
                        options={[
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No' },
                          { value: 'not sure', label: 'Not sure' },
                        ]}
                      />
                    </div>

                  </CardContent>
                </Card>

                {/* SECTION 4: Financial Context */}
                <Card className="border-none shadow-sm bg-card/50">
                  <CardHeader>
                    <CardTitle>Financial Reality</CardTitle>
                    <CardDescription>A quick budget sanity check.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Display profile data instead of asking */}
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Monthly Budget:</span>
                        <span className="text-lg font-bold">
                          {profile ? `${profile.currency || '$'} ${profile.monthly_budget || 0}` : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Active Savings Goal:</span>
                        <span className="text-sm">
                          {profile?.savings_goal_reward
                            ? `${profile.savings_goal_reward} ($${profile.savings_goal_amount})`
                            : 'No active active goal set'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                      * This purchase will be analyzed against your set budget and goals.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label>How easy is it to return/refund?</Label>
                      <RadioGroup
                        name="refundEase"
                        value={formData.refundEase}
                        onChange={handleRadioChange}
                        options={[
                          { value: 'easy', label: 'Easy (Free returns)' },
                          { value: 'moderate', label: 'Moderate (Shipping costs/Time)' },
                          { value: 'hard', label: 'Hard / Final Sale' },
                        ]}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={!canSubmit || loading || !!analysisResult} size="lg" className="w-full sm:w-auto">
                    {analysisResult ? (
                      <>Analysis Complete</>
                    ) : loading ? (
                      <>Analyzing...</>
                    ) : (
                      <>Get Analysis <Sparkles className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>

              </form>
            </div>
          </TabsContent>

          <TabsContent value="result">
            {analysisResult ? (
              <div ref={resultRef} className="mt-8">
                <AnalysisResult result={analysisResult} />
                <div className="flex justify-center mt-8">
                  <Button variant="outline" onClick={() => {
                    setAnalysisResult(null);
                    setActiveTab('survey');
                  }}>
                  Analyze Another Item
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed rounded-lg border-muted">
                <div className="p-4 bg-muted rounded-full">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No Analysis Yet</h3>
                <p className="text-muted-foreground max-w-sm">
                Please complete the survey in the &quot;Survey&quot; tab and click
                &quot;Get Analysis&quot; to see your results here.
                </p>
                <Button variant="default" onClick={() => setActiveTab('survey')}>
                Go to Survey
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// Helper Components for clean UI without extra deps

function RadioGroup({ name, value, onChange, options }: {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
            ${value === option.value
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border hover:bg-accent/50'}`}
        >
          <div className={`flex items-center justify-center w-4 h-4 rounded-full border mr-3
            ${value === option.value ? 'border-primary' : 'border-muted-foreground'}`}>
            {value === option.value && <div className="w-2 h-2 rounded-full bg-primary" />}
          </div>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(name, e.target.value)}
            className="hidden"
          />
          <span className={`text-sm ${value === option.value ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
