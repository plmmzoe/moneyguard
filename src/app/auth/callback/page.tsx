import { Suspense } from 'react';

import { AuthCallbackHandler } from './AuthCallbackHandler';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">Signing you in…</p>
      </div>
    }>
      <AuthCallbackHandler />
    </Suspense>
  );
}
