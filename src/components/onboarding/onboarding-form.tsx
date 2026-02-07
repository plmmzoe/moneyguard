'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OnboardingFormProps {
  initialData?: {
    username?: string | null;
    monthlyBudget?: number | null;
    currency?: string | null;
    savingsGoalAmount?: number | null;
    savingsGoalReward?: string | null;
    savingsGoalDescription?: string | null;
    savingsGoalTargetDate?: string | null;
    hobbies?: { name: string; rating: number }[] | null;
  };
  onSubmit: (data: {
    username: string;
    monthlyBudget: number;
    currency: string;
    savingsGoalAmount: number;
    savingsGoalReward: string;
    savingsGoalDescription: string;
    savingsGoalTargetDate: string;
    hobbies: { name: string; rating: number }[];
  }) => Promise<void>;
  onSkip?: () => Promise<void>;
  isLoading?: boolean;
}

type Step = 'budget' | 'rewards' | 'hobbies';

const CURRENCY_OPTIONS = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'CNY',
  'INR',
  'MXN',
];

export function OnboardingForm({ initialData, onSubmit, onSkip, isLoading = false }: OnboardingFormProps) {
  const [step, setStep] = useState<Step>('budget');
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    monthlyBudget: initialData?.monthlyBudget?.toString() || '',
    currency: initialData?.currency || 'USD',
    savingsGoalAmount: initialData?.savingsGoalAmount?.toString() || '',
    savingsGoalReward: initialData?.savingsGoalReward || '',
    savingsGoalDescription: initialData?.savingsGoalDescription || '',
    savingsGoalTargetDate: initialData?.savingsGoalTargetDate?.split('T')[0] || '',
    hobbies: (initialData?.hobbies || []).map(h => ({
      name: h.name,
      rating: h.rating,
      id: `${h.name}-${h.rating}`,
    })) as { name: string; rating: number; id?: string }[],
  });

  // Hobbies local state
  const [hobbyInput, setHobbyInput] = useState('');
  const [hobbyRating, setHobbyRating] = useState(5);

  // savings description local optional field is part of formData

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validateStep = (currentStep: Step): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    if (currentStep === 'budget') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      }
      if (!formData.monthlyBudget || parseFloat(formData.monthlyBudget) <= 0) {
        newErrors.monthlyBudget = 'Monthly budget must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 'budget') {
        setStep('rewards');
      } else if (step === 'rewards') {
        setStep('hobbies');
      }
    }
  };

  const handleBack = () => {
    if (step === 'rewards') {
      setStep('budget');
    } else if (step === 'hobbies') {
      setStep('rewards');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (validateStep(step)) {
      try {
        await onSubmit({
          username: formData.username,
          monthlyBudget: parseFloat(formData.monthlyBudget),
          currency: formData.currency,
          savingsGoalAmount: parseFloat(formData.savingsGoalAmount),
          savingsGoalReward: formData.savingsGoalReward,
          savingsGoalDescription: formData.savingsGoalDescription,
          savingsGoalTargetDate: formData.savingsGoalTargetDate,
          hobbies: formData.hobbies.map(({ name, rating }) => ({ name, rating })),
        });
      } catch (error) {
        setErrors({
          submit: error instanceof Error ? error.message : 'An error occurred',
        });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-6 space-y-6">
        {/* Step Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={`font-medium ${step === 'budget' ? 'text-primary' : 'text-muted-foreground'}`}>
              Budget
            </span>
            <span className={`font-medium ${step === 'rewards' ? 'text-primary' : 'text-muted-foreground'}`}>
              Rewards
            </span>
            <span className={`font-medium ${step === 'hobbies' ? 'text-primary' : 'text-muted-foreground'}`}>
              Interests
            </span>
          </div>
          <div className="flex gap-2">
            <div className={`flex-1 h-1 rounded ${step === 'budget' || step === 'rewards' || step === 'hobbies' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex-1 h-1 rounded ${step === 'rewards' || step === 'hobbies' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex-1 h-1 rounded ${step === 'hobbies' ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          {step === 'budget' && (
            <>
              <h2 className="text-lg font-semibold">Setup Your Budget</h2>
              <p className="text-sm text-muted-foreground">Let&apos;s start by setting up your monthly budget and preferences.</p>

              {/* Username */}
              <div className="grid w-full gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              </div>

              {/* Monthly Budget */}
              <div className="grid w-full gap-2">
                <Label htmlFor="monthlyBudget">Monthly Budget</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.monthlyBudget}
                  onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
                  className={errors.monthlyBudget ? 'border-red-500' : ''}
                />
                {errors.monthlyBudget && <p className="text-sm text-red-500">{errors.monthlyBudget}</p>}
              </div>

              {/* Currency */}
              <div className="grid w-full gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Monthly irregular spending step removed */}

          {step === 'rewards' && (
            <>
              <h2 className="text-lg font-semibold">Set Your Savings Goal</h2>
              <p className="text-sm text-muted-foreground">What do you want to save for and reward yourself with?</p>

              {/* Target Amount */}
              <div className="grid w-full gap-2">
                <Label htmlFor="savingsGoalAmount">Target Savings Amount</Label>
                <Input
                  id="savingsGoalAmount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.savingsGoalAmount}
                  onChange={(e) => handleInputChange('savingsGoalAmount', e.target.value)}
                  className={errors.savingsGoalAmount ? 'border-red-500' : ''}
                />
                {errors.savingsGoalAmount && <p className="text-sm text-red-500">{errors.savingsGoalAmount}</p>}
              </div>

              {/* Reward */}
              <div className="grid w-full gap-2">
                <Label htmlFor="savingsGoalReward">Reward Yourself With</Label>
                <Input
                  id="savingsGoalReward"
                  placeholder="e.g., A weekend trip, new gadget, etc."
                  value={formData.savingsGoalReward}
                  onChange={(e) => handleInputChange('savingsGoalReward', e.target.value)}
                  className={errors.savingsGoalReward ? 'border-red-500' : ''}
                />
                {errors.savingsGoalReward && <p className="text-sm text-red-500">{errors.savingsGoalReward}</p>}
              </div>

              {/* Target Date */}
              <div className="grid w-full gap-2">
                <Label htmlFor="savingsGoalTargetDate">Target Savings Date</Label>
                <Input
                  id="savingsGoalTargetDate"
                  type="date"
                  value={formData.savingsGoalTargetDate}
                  onChange={(e) => handleInputChange('savingsGoalTargetDate', e.target.value)}
                  className={errors.savingsGoalTargetDate ? 'border-red-500' : ''}
                />
                {errors.savingsGoalTargetDate && (
                  <p className="text-sm text-red-500">{errors.savingsGoalTargetDate}</p>
                )}
              </div>

              {/* Description */}
              <div className="grid w-full gap-2">
                <Label htmlFor="savingsGoalDescription">Description (optional)</Label>
                <Input
                  id="savingsGoalDescription"
                  placeholder="Describe this savings goal"
                  value={formData.savingsGoalDescription}
                  onChange={(e) => handleInputChange('savingsGoalDescription', e.target.value)}
                />
              </div>
            </>
          )}

          {step === 'hobbies' && (
            <>
              <h2 className="text-lg font-semibold">Hobbies & Interests</h2>
              <p className="text-sm text-muted-foreground">Add your hobbies and rate how much you are invested in them (1-10).</p>

              <div className="space-y-4">
                <div className="flex gap-2 items-end">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="hobbyName">Hobby / Interest</Label>
                    <Input
                      id="hobbyName"
                      placeholder="e.g. Photography, Cycling"
                      value={hobbyInput}
                      onChange={(e) => setHobbyInput(e.target.value)}
                    />
                  </div>
                  <div className="grid w-20 gap-2">
                    <Label htmlFor="hobbyRating">Rating</Label>
                    <Input
                      id="hobbyRating"
                      type="number"
                      min="1"
                      max="10"
                      value={hobbyRating}
                      onChange={(e) => setHobbyRating(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      if (hobbyInput.trim() && hobbyRating >= 1 && hobbyRating <= 10) {
                        const newHobby = {
                          name: hobbyInput.trim(),
                          rating: hobbyRating,
                          id: `${Date.now().toString()  }-${  Math.random().toString(36).slice(2)}`,
                        };
                        setFormData(prev => ({
                          ...prev,
                          hobbies: [...prev.hobbies, newHobby],
                        }));
                        setHobbyInput('');
                        setHobbyRating(5);
                      }
                    }}
                    variant="secondary"
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.hobbies.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No hobbies added yet.</p>
                  )}
                  {formData.hobbies.map((hobby) => (
                    <div key={hobby.id ?? `${hobby.name}-${hobby.rating}`} className="flex justify-between items-center p-2 border rounded-md">
                      <div>
                        <span className="font-medium">{hobby.name}</span>
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{hobby.rating}/10</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            hobbies: prev.hobbies.filter((h) => h.id !== hobby.id),
                          }));
                        }}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 'budget' || isLoading}
            >
              Back
            </Button>
            {onSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                disabled={isLoading}
              >
                Skip
              </Button>
            )}
          </div>

          {step !== 'hobbies' ? (
            <Button onClick={handleNext} disabled={isLoading}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
