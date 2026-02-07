'use client';

import type { User } from '@supabase/supabase-js';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { createClient } from '@/utils/supabase/client';

export function OnboardingNotification({ user }: { user: User | null }) {
  const [showNotification, setShowNotification] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (!user) {return;}

    const checkNewUserStatus = async () => {
      // Check if we've already shown notification this session
      const sessionKey = `onboarding_notified_${user.id}`;
      if (sessionStorage.getItem(sessionKey)) {
        return;
      }

      // Check if user has a profile (new user = no profile)
      const supabase = createClient();
      if (!supabase) {return;}

      const { data: profile } = await supabase
        .from('profiles')
        .select('setup_complete')
        .eq('user_id', user.id)
        .single();

      if (!profile || !profile.setup_complete) {
        // New user or incomplete setup - show notification
        setIsNewUser(true);
        setShowNotification(true);
        sessionStorage.setItem(sessionKey, 'true');
      }
    };

    checkNewUserStatus();
  }, [user]);

  if (!showNotification || !isNewUser) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-card border border-border rounded-lg shadow-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">Welcome to MoneyGuard!</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Complete your profile setup to get started with personalized financial insights.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
          >
            Start Setup
          </Link>
        </div>
        <button
          onClick={() => setShowNotification(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
