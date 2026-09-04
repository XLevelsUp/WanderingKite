import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { NotificationProvider } from '@/components/ui/NotificationProvider';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'sans-serif',
  ],
});

// Belt-and-suspenders with the noindex header already set in next.config.ts —
// this is the staff ERP app and must never be indexed.
export const metadata: Metadata = {
  title: {
    default: 'Wandering Kite Studio | Staff Admin',
    template: `%s | Wandering Kite Admin`,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <ThemeProvider />
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextTopLoader
          color="#f59e0b"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #f59e0b,0 0 5px #f59e0b"
        />
        <NotificationProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </NotificationProvider>
      </body>
    </html>
  );
}
