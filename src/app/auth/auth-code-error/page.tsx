import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-xl font-semibold">Invalid or expired link</h1>
      <p className="max-w-sm text-muted-foreground">
        This sign-in or reset link is invalid or has expired. Request a new one and try again.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/auth/forgot-password"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Reset password
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
