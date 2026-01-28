'use client';

import Link from 'next/link';

import Header from '@/components/home/header/header';

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16 font-sans text-gray-800">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            SpendGuard AI
          </h1>
          <h2 className="text-xl text-gray-600 font-medium">
            Evidence-based behavioral intervention for your wallet
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed">
            Stop impulse buying before it happens. SpendGuard AI analyzes your purchase intent in real-time,
            predicts regret, and guides you to smarter financial decisions.
          </p>
        </section>

        {/* What SpendGuard AI Does */}
        <section>
          <h3 className="text-2xl font-semibold mb-6 text-gray-900 border-b pb-2">How It Works</h3>
          <ul className="grid gap-4 sm:grid-cols-2">
            <li className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Impulse Detection</h4>
              <p className="text-gray-600">Identifies high-risk spending moments before you checkout.</p>
            </li>
            <li className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Cool-off Guidance</h4>
              <p className="text-gray-600">Enforces strategic pauses to let logical thinking override emotion.</p>
            </li>
            <li className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Regret Prediction</h4>
              <p className="text-gray-600">Uses behavioral models to forecast how you'll feel about this purchase in 30 days.</p>
            </li>
            <li className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Value Assessment</h4>
              <p className="text-gray-600">Suggests cheaper alternatives or better ways to use your money.</p>
            </li>
          </ul>
        </section>

        {/* How It’s Different */}
        <section className="bg-slate-50 p-8 rounded-xl border border-slate-100">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">Why SpendGuard?</h3>
          <p className="text-gray-600 mb-4">
            Traditional budgeting apps tell you where you went wrong <em>after</em> the money is gone.
            SpendGuard AI acts as a <strong>behavioral firewall</strong>, intervening <em>before</em> the transaction occurs.
          </p>
          <p className="text-gray-600">
            We focus on the psychology of spending, helping you build healthier habits without shame or guilt.
          </p>
        </section>

        {/* Call to Action & Authentication */}
        <section className="text-center space-y-8 pt-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-900">Take Control Today</h3>
            <p className="text-gray-500">Join the waitlist or log in to your account.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 bg-white text-blue-600 border border-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors w-full sm:w-auto text-center"
            >
              Sign up
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            Powered by Supabase Auth
          </p>
        </section>
      </main>
    </div>
  );
}
