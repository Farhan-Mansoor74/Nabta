"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Detect if we're on the dashboard page
  const isLoggedInPage = pathname === '/volunteer-dashboard';

  return (
    <>
      <Navbar isLoggedIn={isLoggedInPage} />
      <main>{children}</main>
      {!isLoggedInPage && <Footer />}
    </>
  );
}