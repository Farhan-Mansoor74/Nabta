import { createClient } from '@/lib/supabase/server';
import { NextResponse, NextRequest } from 'next/server';

// GET - Get company information for the authenticated user
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.warn('GET /api/companies: Unauthorized - No user session found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, find the company the user belongs to
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('company_team_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    if (teamMemberError || !teamMember) {
      console.warn(`GET /api/companies: User ${user.id} not found in any company team.`);
      return NextResponse.json({ error: 'User is not part of any company' }, { status: 404 });
    }

    // Now, fetch the company details using the company_id
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', teamMember.company_id)
      .single();

    if (companyError) {
      if (companyError.code === 'PGRST116') {
        console.error('GET /api/companies: Company ID not found for team member.');
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
      throw companyError;
    }
    
    // Attach the user's role to the company object for convenience on the frontend
    const companyWithRole = { ...company, user_role: teamMember.role };

    return NextResponse.json(companyWithRole);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch company',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create a new company
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { company_name, industry, website, email } = body;

    if (!company_name || !email) {
      return NextResponse.json({ error: 'Company name and email are required' }, { status: 400 });
    }

    // Check if user is already part of a company
    const { data: existingMember } = await supabase
      .from('company_team_members')
      .select('company_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({ error: 'User is already in a company' }, { status: 400 });
    }

    // Create the new company
    const { data: newCompany, error: createCompanyError } = await supabase
      .from('companies')
      .insert({ company_name, industry, website, email })
      .select()
      .single();

    if (createCompanyError) {
      throw createCompanyError;
    }

    // Add the creator as an admin team member
    const { error: addMemberError } = await supabase
      .from('company_team_members')
      .insert({
        company_id: newCompany.id,
        user_id: user.id,
        role: 'admin',
        status: 'accepted',
        invited_by: user.id,
        accepted_at: new Date().toISOString()
      });

    if (addMemberError) {
      // Optional: Add rollback logic here to delete the company if adding the member fails
      throw addMemberError;
    }

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ 
      error: 'Failed to create company',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update company information
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's role
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('company_team_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json({ error: 'User is not part of any company' }, { status: 403 });
    }

    if (teamMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update company information' }, { status: 403 });
    }

    const body = await request.json();
    const { company_name, industry, website, email, logo_url } = body;

    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        company_name,
        industry,
        website,
        email,
        logo_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamMember.company_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json({ 
      error: 'Failed to update company',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}