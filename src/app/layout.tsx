import '../styles/globals.css';
import '../styles/layout.css';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';

import { Toaster } from '@/components/ui/toaster';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

const siteTitle = 'Money Guard';
const siteDescription =
  'Money Guard helps you analyze your spending and make better decisions about your money.';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://themoneyguard.space',
  ),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  icons: {
    icon: [
      {
        url: '/assets/logo/logo.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    type: 'website',
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    images: [
      {
        url: '/assets/logo/logo-complete.png',
        width: 512,
        height: 512,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/assets/logo/logo-complete.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full">
      <body className="min-h-full overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
