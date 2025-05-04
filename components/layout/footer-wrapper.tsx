"use client";

import { usePathname } from 'next/navigation';
import Footer from './footer';

export default function FooterWrapper() {
  const pathname = usePathname();
  const isLoggedInPage = pathname === '/volunteer-dashboard';
  
  if (isLoggedInPage) {
    return null;
  }
  
  return <Footer />;
}