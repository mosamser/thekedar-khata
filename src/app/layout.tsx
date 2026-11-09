import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppLayout } from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'Thekedar Khata - ठेकेदार डायरी | Contractor Attendance & Accounts',
  description: 'निर्माण ठेकेदार, मजदूर हाजिरी, रोज का खर्चा और मालिक से हिसाब डायरी',
  applicationName: 'Thekedar Khata',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    title: 'Thekedar Khata',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className="antialiased selection:bg-amber-500 selection:text-slate-950">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}

