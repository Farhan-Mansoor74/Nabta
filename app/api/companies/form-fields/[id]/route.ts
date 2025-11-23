import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function PUT(
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

    // Update the field
    const { data: updatedField, error: updateError } = await supabase
      .from('company_form_fields')
      .update({
        field_name,
        field_label,
        field_type,
        field_placeholder,
        is_required,
        select_options,
        validation_rules,
        display_order,
        is_active
      })
      .eq('id', id)
      .eq('company_id', companyMember.company_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating form field:', updateError);
      return NextResponse.json({ error: 'Failed to update form field' }, { status: 500 });
    }

    if (!updatedField) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    return NextResponse.json(updatedField);

  } catch (error) {
    console.error('Error in PUT /api/companies/form-fields/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Delete the field
    const { error: deleteError } = await supabase
      .from('company_form_fields')
      .delete()
      .eq('id', id)
      .eq('company_id', companyMember.company_id);

    if (deleteError) {
      console.error('Error deleting form field:', deleteError);
      return NextResponse.json({ error: 'Failed to delete form field' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Field deleted successfully' });

  } catch (error) {
    console.error('Error in DELETE /api/companies/form-fields/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
