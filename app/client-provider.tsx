"use client";
import { UserProvider } from '@/hooks/useUser';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
} 