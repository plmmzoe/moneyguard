'use client';

import { useState } from 'react';

import { updateSavingsGoal } from '@/app/savings/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/lib/database.types';

interface EditSavingsGoalFormProps {
  goal: Tables<'savings'>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditSavingsGoalForm({
  goal,
  onSuccess,
  onCancel,
}: EditSavingsGoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: goal.name || '',
    goal: goal.goal?.toString() || '',
    description: goal.description || '',
    expire_at: goal.expire_at ? goal.expire_at.split('T')[0] : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    if (!formData.goal || parseFloat(formData.goal) <= 0) {
      newErrors.goal = 'Goal amount must be greater than 0';
    }

    if (!formData.expire_at) {
      newErrors.expire_at = 'Target date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await updateSavingsGoal(goal.id, {
        name: formData.name,
        goal: parseFloat(formData.goal),
        description: formData.description || undefined,
        expire_at: formData.expire_at,
      });

      toast({
        title: 'Success',
        description: 'Savings goal updated successfully',
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update goal',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Goal Name */}
      <div className="grid w-full gap-2">
        <Label htmlFor="edit-name">Goal Name</Label>
        <Input
          id="edit-name"
          placeholder="e.g., Vacation, New Car, Emergency Fund"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={errors.name ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Goal Amount */}
      <div className="grid w-full gap-2">
        <Label htmlFor="edit-goal">Target Amount</Label>
        <Input
          id="edit-goal"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={formData.goal}
          onChange={(e) => handleChange('goal', e.target.value)}
          className={errors.goal ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.goal && <p className="text-sm text-red-500">{errors.goal}</p>}
      </div>

      {/* Description */}
      <div className="grid w-full gap-2">
        <Label htmlFor="edit-description">Description (optional)</Label>
        <Input
          id="edit-description"
          placeholder="Add details about this goal"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Target Date */}
      <div className="grid w-full gap-2">
        <Label htmlFor="edit-expire_at">Target Date</Label>
        <Input
          id="edit-expire_at"
          type="date"
          value={formData.expire_at}
          onChange={(e) => handleChange('expire_at', e.target.value)}
          className={errors.expire_at ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.expire_at && <p className="text-sm text-red-500">{errors.expire_at}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Updating...' : 'Update Goal'}
        </Button>
      </div>
    </form>
  );
}
