import '../styles/globals.css';
import '../styles/layout.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  metadataBase: new URL('https://paddle-billing.vercel.app'),
  title: 'Money Guard',
  description:
    'Money Guard is a tool that helps you analyze your spending and make better decisions about your money.',
  icons: {
    icon: [
      {
        url: '/assets/logo/logo.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
