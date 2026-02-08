'use client';

import Link from 'next/link';

import Header from '@/components/home/header/header';
import { useUserInfo } from '@/hooks/useUserInfo';
import { createClient } from '@/utils/supabase/client';

export function HomePage() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16 font-sans text-foreground">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            MoneyGuard AI
          </h1>
          <h2 className="text-xl text-muted-foreground font-medium">
            Evidence-based behavioral intervention for your wallet
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            Stop impulse buying before it happens. MoneyGuard AI analyzes your purchase intent in real-time,
            predicts regret, and guides you to smarter financial decisions.
          </p>
        </section>

        {/* What MoneyGuard AI Does */}
        <section>
          <h3 className="text-2xl font-semibold mb-6 text-foreground border-b border-border pb-2">How It Works</h3>
          <ul className="grid gap-4 sm:grid-cols-2">
            <li className="bg-card p-4 rounded-lg border border-border/60">
              <h4 className="font-semibold text-foreground mb-2">Impulse Detection</h4>
              <p className="text-muted-foreground">Identifies high-risk spending moments before you checkout.</p>
            </li>
            <li className="bg-card p-4 rounded-lg border border-border/60">
              <h4 className="font-semibold text-foreground mb-2">Cool-off Guidance</h4>
              <p className="text-muted-foreground">Enforces strategic pauses to let logical thinking override emotion.</p>
            </li>
            <li className="bg-card p-4 rounded-lg border border-border/60">
              <h4 className="font-semibold text-foreground mb-2">Regret Prediction</h4>
              <p className="text-muted-foreground">Uses behavioral models to forecast how you&apos;ll feel about this purchase in 30 days.</p>
            </li>
            <li className="bg-card p-4 rounded-lg border border-border/60">
              <h4 className="font-semibold text-foreground mb-2">Value Assessment</h4>
              <p className="text-muted-foreground">Suggests cheaper alternatives or better ways to use your money.</p>
            </li>
          </ul>
        </section>

        {/* How It's Different */}
        <section className="bg-card p-4 sm:p-6 md:p-8 rounded-xl border border-border">
          <h3 className="text-2xl font-semibold mb-4 text-foreground">Why MoneyGuard?</h3>
          <p className="text-muted-foreground mb-4">
            Traditional budgeting apps tell you where you went wrong <em>after</em> the money is gone.
            MoneyGuard AI acts as a <strong>behavioral firewall</strong>, intervening <em>before</em>{' '}
            the transaction occurs.
          </p>
          <p className="text-muted-foreground">
            We focus on the psychology of spending, helping you build healthier habits without shame or guilt.
          </p>
        </section>

        {/* Call to Action & Authentication */}
        <section className="text-center space-y-8 pt-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">Take Control Today</h3>
            <p className="text-muted-foreground">
              {user?.id ? 'Go to your dashboard or run a new analysis.' : 'Join the waitlist or log in to your account.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user?.id ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto text-center"
                >
                  Dashboard
                </Link>
                <Link
                  href="/analyze"
                  className="px-8 py-3 bg-white text-primary border border-primary font-medium rounded-lg hover:bg-primary/5 transition-colors w-full sm:w-auto text-center"
                >
                  New Analysis
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto text-center"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-8 py-3 bg-white text-primary border border-primary font-medium rounded-lg hover:bg-primary/5 transition-colors w-full sm:w-auto text-center"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by Supabase Auth
          </p>
        </section>
      </main>
    </div>
  );
}
