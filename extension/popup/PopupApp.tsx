import React, { useEffect, useState } from 'react';

import { createAuthApi } from 'shared/auth';
import type { User } from '@supabase/supabase-js';
import { createExtensionSupabaseClient } from '../scripts/supabase-extension';

import './popup.css';

export function PopupApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'buttons' | 'login' | 'signup'>('buttons');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authApi, setAuthApi] = useState<ReturnType<typeof createAuthApi> | null>(null);

  useEffect(() => {
    let mounted = true;
    // @ts-ignore
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    // @ts-ignore
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    (async () => {
      try {
        if (!url || !anonKey) {
          setError('Extension not configured. Build with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
          setLoading(false);
          return;
        }
        const client = await createExtensionSupabaseClient(url, anonKey);
        const auth = createAuthApi(client);
        setAuthApi(() => auth);
        const sessionUser = await auth.getUser();
        if (mounted) setUser(sessionUser ?? null);
        auth.onAuthStateChange((_event, session) => {
          if (mounted) { // @ts-ignore
            setUser(session?.user ?? null);
          }
        });
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to init');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!authApi) return;
    const { error: err } = await authApi.signInWithPassword({ email, password });
    if (err) {
      setError('Invalid email or password');
      return;
    }
    setView('buttons');
    setEmail('');
    setPassword('');
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!authApi) return;
    const { error: err } = await authApi.signUp({ email, password });
    if (err) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setView('buttons');
    setEmail('');
    setPassword('');
  }

  async function handleLogout() {
    if (!authApi) return;
    await authApi.signOut();
    setView('buttons');
  }

  if (loading) {
    return (
      <div className="popup-container">
        <p className="popup-loading">Loading…</p>
      </div>
    );
  }

  if (error && !user && !authApi) {
    return (
      <div className="popup-container">
        <p className="popup-error">{error}</p>
      </div>
    );
  }

  if (user && view === 'buttons') {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <span className="popup-title">MoneyGuard</span>
        </div>
        <div className="popup-user">
          <p className="popup-email">{user.email ?? 'Signed in'}</p>
          <button type="button" className="popup-btn popup-btn-secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <button type="button" className="popup-back" onClick={() => setView('buttons')} aria-label="Back">
            ←
          </button>
          <span className="popup-title">Log in</span>
        </div>
        <form onSubmit={handleLogin} className="popup-form">
          <label className="popup-label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className="popup-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
          <label className="popup-label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className="popup-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <p className="popup-error">{error}</p>}
          <button type="submit" className="popup-btn popup-btn-primary">
            Log in
          </button>
        </form>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <button type="button" className="popup-back" onClick={() => setView('buttons')} aria-label="Back">
            ←
          </button>
          <span className="popup-title">Sign up</span>
        </div>
        <form onSubmit={handleSignup} className="popup-form">
          <label className="popup-label" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            className="popup-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
          <label className="popup-label" htmlFor="signup-password">
            Password (min 8 characters)
          </label>
          <input
            id="signup-password"
            type="password"
            className="popup-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          {error && <p className="popup-error">{error}</p>}
          <button type="submit" className="popup-btn popup-btn-primary">
            Sign up
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="popup-header">
        <span className="popup-title">MoneyGuard</span>
      </div>
      <div className="popup-actions">
        <button type="button" className="popup-btn popup-btn-primary" onClick={() => setView('login')}>
          Log in
        </button>
        <button type="button" className="popup-btn popup-btn-secondary" onClick={() => setView('signup')}>
          Sign up
        </button>
      </div>
    </div>
  );
}
