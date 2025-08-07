import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './supabaseClient';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sign up volunteer
export async function signUpVolunteer({ username, email, password }: { username: string; email: string; password: string }) {
  // Step 1: Sign up with role metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'volunteer' },
    },
  });
  if (error) return { error };
  // Step 2: Create volunteer profile via RPC
  const userId = data.user?.id;
  if (!userId) return { error: { message: 'No user ID returned from signup.' } };
  const { error: profileError } = await supabase.rpc('create_volunteer_profile', {
    user_id: userId,
    username_param: username,
    email_param: email,
  });

  if (profileError) return { error: profileError };
  return { data };
}

// Sign up company
export async function signUpCompany({ companyName, industry, website, email, password, pricingPlan }: {
  companyName: string;
  industry: string;
  website: string;
  email: string;
  password: string;
  pricingPlan: string;
}) {
  // Step 1: Sign up with role metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'company' },
    },
  });
  if (error) return { error };
  // Step 2: Create company profile via RPC
  const userId = data.user?.id;
  if (!userId) return { error: { message: 'No user ID returned from signup.' } };
  const { error: profileError } = await supabase.rpc('create_company_profile', {
    user_id: userId,
    company_name_param: companyName,
    website_param: website,
    email_param: email,
    industry_param: industry,
  });
  
  if (profileError) return { error: profileError };
  return { data };
}

// Login (for both roles)
export async function login({ email, password }: { email: string; password: string }) {
  return supabase.auth.signInWithPassword({ email, password });
}
