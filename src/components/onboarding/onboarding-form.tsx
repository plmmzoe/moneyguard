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
    username?: string;
    monthlyBudget?: number;
    currency?: string;
    monthlyIrregularSpending?: number;
    savingsGoalAmount?: number;
    savingsGoalReward?: string;
    savingsGoalTargetDate?: string;
  };
  onSubmit: (data: {
    username: string;
    monthlyBudget: number;
    currency: string;
    monthlyIrregularSpending: number;
    savingsGoalAmount: number;
    savingsGoalReward: string;
    savingsGoalTargetDate: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

type Step = 'budget' | 'spending' | 'rewards';

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

export function OnboardingForm({ initialData, onSubmit, isLoading = false }: OnboardingFormProps) {
  const [step, setStep] = useState<Step>('budget');
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    monthlyBudget: initialData?.monthlyBudget?.toString() || '',
    currency: initialData?.currency || 'USD',
    monthlyIrregularSpending: initialData?.monthlyIrregularSpending?.toString() || '',
    savingsGoalAmount: initialData?.savingsGoalAmount?.toString() || '',
    savingsGoalReward: initialData?.savingsGoalReward || '',
    savingsGoalTargetDate: initialData?.savingsGoalTargetDate?.split('T')[0] || '',
  });

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
    } else if (currentStep === 'spending') {
      if (
        formData.monthlyIrregularSpending &&
        parseFloat(formData.monthlyIrregularSpending) < 0
      ) {
        newErrors.monthlyIrregularSpending = 'Must be 0 or greater';
      }
    } else if (currentStep === 'rewards') {
      if (!formData.savingsGoalAmount || parseFloat(formData.savingsGoalAmount) <= 0) {
        newErrors.savingsGoalAmount = 'Savings goal must be greater than 0';
      }
      if (!formData.savingsGoalReward.trim()) {
        newErrors.savingsGoalReward = 'Reward is required';
      }
      if (!formData.savingsGoalTargetDate) {
        newErrors.savingsGoalTargetDate = 'Target date is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 'budget') {
        setStep('spending');
      } else if (step === 'spending') {
        setStep('rewards');
      }
    }
  };

  const handleBack = () => {
    if (step === 'spending') {
      setStep('budget');
    } else if (step === 'rewards') {
      setStep('spending');
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
          monthlyIrregularSpending: formData.monthlyIrregularSpending
            ? parseFloat(formData.monthlyIrregularSpending)
            : 0,
          savingsGoalAmount: parseFloat(formData.savingsGoalAmount),
          savingsGoalReward: formData.savingsGoalReward,
          savingsGoalTargetDate: formData.savingsGoalTargetDate,
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
            <span className={`font-medium ${step === 'spending' ? 'text-primary' : 'text-muted-foreground'}`}>
              Spending
            </span>
            <span className={`font-medium ${step === 'rewards' ? 'text-primary' : 'text-muted-foreground'}`}>
              Rewards
            </span>
          </div>
          <div className="flex gap-2">
            <div className={`flex-1 h-1 rounded ${step === 'budget' || step === 'spending' || step === 'rewards' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex-1 h-1 rounded ${step === 'spending' || step === 'rewards' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex-1 h-1 rounded ${step === 'rewards' ? 'bg-primary' : 'bg-muted'}`} />
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

          {step === 'spending' && (
            <>
              <h2 className="text-lg font-semibold">Monthly Irregular Spending</h2>
              <p className="text-sm text-muted-foreground">How much do you typically spend on irregular expenses each month?</p>

              <div className="grid w-full gap-2">
                <Label htmlFor="monthlyIrregularSpending">Monthly Irregular Spending Target</Label>
                <Input
                  id="monthlyIrregularSpending"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.monthlyIrregularSpending}
                  onChange={(e) => handleInputChange('monthlyIrregularSpending', e.target.value)}
                  className={errors.monthlyIrregularSpending ? 'border-red-500' : ''}
                />
                {errors.monthlyIrregularSpending && (
                  <p className="text-sm text-red-500">{errors.monthlyIrregularSpending}</p>
                )}
                <p className="text-xs text-muted-foreground">Optional - leave blank if not applicable</p>
              </div>
            </>
          )}

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
            </>
          )}

          {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 'budget' || isLoading}
          >
            Back
          </Button>

          {step !== 'rewards' ? (
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
