import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for bypassing RLS during signup
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { volunteer_id, company_id, custom_field_data } = body;

    // Validate required fields
    if (!volunteer_id || !company_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use admin client to bypass RLS (this is safe because we're creating during signup)
    const { data, error } = await supabaseAdmin
      .from('volunteer_company_associations')
      .insert({
        volunteer_id,
        company_id,
        custom_field_data: custom_field_data || {},
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating volunteer-company association:', error);
      return NextResponse.json({ error: 'Failed to create association' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error in POST /api/volunteer-company-association:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
