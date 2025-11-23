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

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company
    const { data: companyMember, error: memberError } = await supabase
      .from('company_team_members')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .single();

    if (memberError || !companyMember) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, company_name')
      .eq('id', companyMember.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get form fields for this company
    const { data: fields, error: fieldsError } = await supabase
      .from('company_form_fields')
      .select('*')
      .eq('company_id', companyMember.company_id)
      .order('display_order', { ascending: true });

    if (fieldsError) {
      console.error('Error fetching form fields:', fieldsError);
      return NextResponse.json({ error: 'Failed to fetch form fields' }, { status: 500 });
    }

    return NextResponse.json({
      fields: fields || [],
      companyName: company.company_name,
      companyId: company.id
    });

  } catch (error) {
    console.error('Error in GET /api/companies/form-fields:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company and verify they're an admin
    const { data: companyMember, error: memberError } = await supabase
      .from('company_team_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .single();

    if (memberError || !companyMember) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (!['owner', 'admin'].includes(companyMember.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      field_name,
      field_label,
      field_type,
      field_placeholder,
      is_required,
      select_options,
      validation_rules,
      display_order,
      is_active
    } = body;

    // Validate required fields
    if (!field_name || !field_label || !field_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert new field
    const { data: newField, error: insertError } = await supabase
      .from('company_form_fields')
      .insert({
        company_id: companyMember.company_id,
        field_name,
        field_label,
        field_type,
        field_placeholder,
        is_required: is_required ?? false,
        select_options,
        validation_rules,
        display_order: display_order ?? 0,
        is_active: is_active ?? true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating form field:', insertError);
      return NextResponse.json({ error: 'Failed to create form field' }, { status: 500 });
    }

    return NextResponse.json(newField, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/companies/form-fields:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company and verify they're an admin
    const { data: companyMember, error: memberError } = await supabase
      .from('company_team_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .single();

    if (memberError || !companyMember) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (!['owner', 'admin'].includes(companyMember.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body (bulk update for all fields)
    const body = await request.json();
    const { fields } = body;

    if (!Array.isArray(fields)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // Update each field
    const updatePromises = fields.map(async (field) => {
      const { id, ...updateData } = field;

      return supabase
        .from('company_form_fields')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyMember.company_id);
    });

    const results = await Promise.all(updatePromises);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Errors updating fields:', errors);
      return NextResponse.json({ error: 'Some fields failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: fields.length });

  } catch (error) {
    console.error('Error in PUT /api/companies/form-fields:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
