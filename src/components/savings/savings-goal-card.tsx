import { Trash2, Edit2, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Saving } from '@/lib/dashboard.type';

interface SavingsGoalCardProps {
  goal: Saving;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetActive?: () => void;
}

export function SavingsGoalCard({
  goal,
  isActive,
  onEdit,
  onDelete,
  onSetActive,
}: SavingsGoalCardProps) {
  const progress = goal.goal && goal.goal > 0 ? (goal.total_amount || 0) / goal.goal : 0;
  const progressPercent = Math.min(100, progress * 100);
  const remaining = goal.goal && goal.goal > 0 ? Math.max(0, goal.goal - (goal.total_amount || 0)) : goal.goal;

  return (
    <Card className={isActive ? 'border-primary bg-primary/5' : ''}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{goal.name || 'Unnamed Goal'}</h3>
              {isActive && (
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              )}
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              title="Edit goal"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              title="Delete goal"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Goal Amount and Progress */}
        {goal.goal && goal.goal > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {(goal.total_amount || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                / {goal.goal.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressPercent.toFixed(0)}% complete</span>
              <span>
                {remaining && remaining > 0
                  ? `${remaining.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} remaining`
                  : 'Goal reached!'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No amount specified</p>
        )}

        {/* Target Date */}
        {goal.expire_at && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target Date:</span>
            <span className="font-medium">
              {new Date(goal.expire_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Set Active Button (for inactive goals) */}
        {!isActive && onSetActive && (
          <Button
            onClick={onSetActive}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Make This Goal Active
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
