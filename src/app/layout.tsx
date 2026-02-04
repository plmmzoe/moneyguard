import '../styles/globals.css';
import '../styles/layout.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  metadataBase: new URL('https://paddle-billing.vercel.app'),
  title: 'AeroEdit',
  description:
    'AeroEdit is a powerful team design collaboration app and image editor. With plans for businesses of all sizes, streamline your workflow with real-time collaboration, advanced editing tools, and seamless project management.',
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
