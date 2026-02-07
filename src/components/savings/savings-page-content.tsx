'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getProfile } from '@/app/dashboard/actions';
import {
  deleteSavingsGoal,
  getSavings,
  setActiveSavingsGoal,
} from '@/app/savings/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Profile, Saving } from '@/lib/dashboard.type';

import { AddSavingsGoalForm } from './add-goal-form';
import { EditSavingsGoalForm } from './edit-goal-form';
import { SavingsGoalCard } from './savings-goal-card';

export function SavingsPageContent() {
  const [goals, setGoals] = useState<Saving[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile]  = useState<Profile|null>(null);

  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSavings();
      setGoals(data);
      setProfile(await getProfile());
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load savings goals',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) {
      return;
    }

    try {
      await deleteSavingsGoal(id);
      loadGoals();
      toast({
        title: 'Success',
        description: 'Savings goal deleted successfully',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete goal',
        variant: 'destructive',
      });
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      await setActiveSavingsGoal(id);
      loadGoals();
      toast({
        title: 'Success',
        description: 'Active savings goal updated',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update active goal',
        variant: 'destructive',
      });
    }
  };

  const handleGoalAdded = () => {
    setIsAddingNew(false);
    loadGoals();
    router.refresh();
  };

  const handleGoalUpdated = () => {
    setEditingId(null);
    loadGoals();
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading savings goals...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Savings Goals</h1>
        <p className="text-muted-foreground">
          Manage your savings goals and track your progress toward financial targets.
        </p>
      </div>

      {/* Add New Goal Form */}
      {isAddingNew && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Savings Goal</CardTitle>
            <CardDescription>Add a new goal to your savings plan</CardDescription>
          </CardHeader>
          <CardContent>
            <AddSavingsGoalForm onSuccess={handleGoalAdded} onCancel={() => setIsAddingNew(false)} />
          </CardContent>
        </Card>
      )}

      {/* Goals List or Empty State */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-muted-foreground">No savings goals yet</p>
            {!isAddingNew && (
              <Button onClick={() => setIsAddingNew(true)}>Create Your First Goal</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Goal Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Active Goal</h2>
            {profile?.savings ? (
              <SavingsGoalCard
                goal={profile.savings}
                isActive
                onEdit={() => setEditingId(profile?.savings?.id ?? 0)}
                onDelete={() => handleDelete(profile?.savings?.id ?? 0)}
              />
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  No active goal selected
                </CardContent>
              </Card>
            )}
          </div>

          {/* Other Goals Section */}
          {goals.filter((g) => g.id !== profile?.savings?.id).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Other Goals</h2>
              <div className="space-y-3">
                {goals
                  .filter((g) => g.id !== profile?.savings?.id)
                  .map((goal) => (
                    <div key={goal.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <SavingsGoalCard
                          goal={goal}
                          isActive={false}
                          onEdit={() => setEditingId(goal.id)}
                          onDelete={() => handleDelete(goal.id)}
                          onSetActive={() => handleSetActive(goal.id)}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editingId !== null && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>Edit Savings Goal</CardTitle>
                <CardDescription>Update the details of your savings goal</CardDescription>
              </CardHeader>
              <CardContent>
                <EditSavingsGoalForm
                  goal={goals.find((g) => g.id === editingId)!}
                  onSuccess={handleGoalUpdated}
                  onCancel={() => setEditingId(null)}
                />
              </CardContent>
            </Card>
          )}

          {/* Add Another Goal Button */}
          {!isAddingNew && !editingId && (
            <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-full">
              + Add Another Goal
            </Button>
          )}
        </>
      )}
    </div>
  );
}
