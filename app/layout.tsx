import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/layout/navbar';
import FooterWrapper from '@/components/layout/footer-wrapper';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/hooks/useUser';
import ClientProvider from './client-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nabta - Connect with Environmental Volunteering Opportunities',
  description: 'Join Nabta to find and participate in local environmental volunteering opportunities. Connect with eco-conscious companies and make a positive impact.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientProvider>
            <Navbar />
            <main>{children}</main>
            <FooterWrapper />
            <Toaster />
          </ClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}