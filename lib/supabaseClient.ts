// lib/supabaseClient.ts
// Updated to use @supabase/ssr for better Next.js compatibility
import { createClient } from './supabase/client';

// Export a singleton instance for client-side use
export const supabase = createClient();