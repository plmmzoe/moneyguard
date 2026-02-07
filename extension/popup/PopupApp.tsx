import React, { useEffect, useState } from 'react';

import { createAuthApi } from 'shared/auth';
import type { User } from '@supabase/supabase-js';
import { createExtensionSupabaseClient } from '../scripts/supabase-extension';

import logoSrc from '../icons/icon.png?url';
import './popup.css';

export function PopupApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'buttons' | 'login' | 'signup'>('buttons');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authApi, setAuthApi] = useState<ReturnType<typeof createAuthApi> | null>(null);

  const appUrl =
    import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://themoneyguard.space';

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
        <div className="popup-card popup-card-signed-in">
          {/* Header */}
          <div className="popup-header-signed-in">
            <div className="popup-header-left">
              <div className="popup-avatar" />
              <div className="popup-user-meta">
                <p className="popup-user-email">{user.email ?? 'Signed in'}</p>
                <button
                  type="button"
                  className="popup-logout-chip popup-logout-chip-inline"
                  onClick={handleLogout}
                >
                  <span className="popup-logout-text">⎋ Sign out</span>
                </button>
              </div>
            </div>
          </div>

          <div className="popup-divider" />

          {/* Main hero area */}
          <div className="popup-main">
            <div className="popup-main-hero">
              <div className="popup-main-icon">
                <span>🧘‍♀️</span>
              </div>
              <h1 className="popup-main-title">Pause &amp; Reflect</h1>
              <p className="popup-main-subtitle">
                Impulse purchases happen fast. Take a moment to breathe before you buy.
              </p>
            </div>

            <div className="popup-main-actions">
              <button
                type="button"
                className="popup-btn popup-btn-primary popup-btn-primary-login popup-main-primary"
                onClick={() => window.open(appUrl, '_blank', 'noreferrer')}
              >
                <span className="popup-main-primary-icon">▶</span>
                <span>Start a Quick Check</span>
              </button>
              <p className="popup-main-caption">Reflect on a purchase in 30s</p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="popup-footer">
            <button
              type="button"
              className="popup-dashboard-btn"
              onClick={() => window.open(appUrl, '_blank', 'noreferrer')}
            >
              <div className="popup-dashboard-left">
                <span className="popup-dashboard-text">Go to Dashboard</span>
              </div>
              <span className="popup-dashboard-open">⧉</span>
            </button>
          </div>
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
          <img src={logoSrc} alt="" className="popup-logo popup-logo-small" />
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
          <button type="submit" className="popup-btn popup-btn-primary popup-btn-primary-login">
            Log in
          </button>
          <a href={appUrl} target="_blank" rel="noreferrer" className="popup-link">
            Visit website
          </a>
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
          <img src={logoSrc} alt="" className="popup-logo popup-logo-small" />
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
          <a href={appUrl} target="_blank" rel="noreferrer" className="popup-link">
            Visit website
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="popup-card">
        <div className="popup-hero">
          <div className="popup-logo-wrapper">
            <div className="popup-logo-glow" />
            <div className="popup-logo-card">
              <img src={logoSrc} alt="" className="popup-logo" />
            </div>
          </div>
          <div className="popup-hero-text">
            <h1 className="popup-hero-title">MoneyGuard</h1>
            <p className="popup-hero-subtitle">Pause. Reflect. Save.</p>
          </div>
        </div>
        <div className="popup-actions">
          <button
            type="button"
            className="popup-btn popup-btn-primary popup-btn-primary-login"
            onClick={() => setView('login')}
          >
            Log in
          </button>
          <button type="button" className="popup-btn popup-btn-secondary" onClick={() => setView('signup')}>
            Sign up
          </button>
          <a href={appUrl} target="_blank" rel="noreferrer" className="popup-link">
            Visit website
          </a>
        </div>
      </div>
    </div>
  );
}
