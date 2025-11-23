import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify company exists and allows public signup
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, company_name, logo_url, signup_description, industry')
      .eq('id', id)
      .eq('is_active', true)
      .eq('allow_public_signup', true)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found or not accepting volunteers' }, { status: 404 });
    }

    // Get active form fields for this company
    const { data: fields, error: fieldsError } = await supabase
      .from('company_form_fields')
      .select('id, field_name, field_label, field_type, field_placeholder, is_required, select_options, validation_rules, display_order')
      .eq('company_id', id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (fieldsError) {
      console.error('Error fetching form fields:', fieldsError);
      return NextResponse.json({ error: 'Failed to fetch form fields' }, { status: 500 });
    }

    return NextResponse.json({
      company,
      fields: fields || []
    });

  } catch (error) {
    console.error('Error in GET /api/companies/[id]/form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
