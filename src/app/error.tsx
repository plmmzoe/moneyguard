'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-white text-gray-900">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-gray-600">We apologize for the inconvenience.</p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          variant="default"
        >
                    Try again
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
        >
                    Go Home
        </Button>
      </div>
    </div>
  );
}
