import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get all active companies that allow public signup
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, company_name, logo_url, signup_description, industry')
      .eq('is_active', true)
      .eq('allow_public_signup', true)
      .order('company_name', { ascending: true });

    if (error) {
      console.error('Error fetching public companies:', error);
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }

    return NextResponse.json({ companies: companies || [] });

  } catch (error) {
    console.error('Error in GET /api/companies/public:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
