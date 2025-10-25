import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get team members for the authenticated user's company
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('❌ Team API: Unauthorized request — no user found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's company
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('company_team_members')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json({ error: 'User is not part of any company' }, { status: 404 });
    }

    // Fetch all team members for the company (WITHOUT joining users table)
    const { data: teamMembers, error } = await supabase
      .from('company_team_members')
      .select('id, user_id, role, status, invited_at, accepted_at, invited_email, invited_by')
      .eq('company_id', teamMember.company_id)
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Now fetch user emails separately from auth.users
    const userIds = teamMembers?.map(m => m.user_id) || [];

    // Fetch user data from auth (we'll do this by making individual queries or using admin API)
    // For now, we'll fetch emails using supabase admin client if available
    // Otherwise, we just return user_ids and let frontend handle it

    const formattedMembers = await Promise.all(
      (teamMembers || []).map(async (member) => {
        // Try to get user email from auth
        const { data: authUser } = await supabase.auth.admin.getUserById(member.user_id).catch(() => ({ data: null }));

        const email = authUser?.user?.email || '';
        const fullName = authUser?.user?.user_metadata?.full_name ||
                        authUser?.user?.user_metadata?.name || '';

        // Create a nice display name from email if no full name
        const displayName = fullName || (email ? email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Team Member');

        return {
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          status: member.status,
          invited_at: member.invited_at,
          accepted_at: member.accepted_at,
          invited_by: member.invited_by,
          invited_email: member.invited_email,
          email: email,
          name: displayName
        };
      })
    );

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({
      error: 'Failed to fetch team members',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Invite a team member
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the inviting user's company and role
    const { data: invitingMember, error: teamMemberError } = await supabase
      .from('company_team_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    if (teamMemberError || !invitingMember) {
      return NextResponse.json({ error: 'Inviting user is not part of any company' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = 'member' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Look up the user by email in auth.users
    const { data: { users: authUsers }, error: userLookupError } = await supabase.auth.admin.listUsers();

    const targetUser = authUsers?.find(u => u.email === email);

    // If user exists, check they're not already a member
    if (targetUser) {
      const { data: existingMember } = await supabase
        .from('company_team_members')
        .select('id, status')
        .eq('company_id', invitingMember.company_id)
        .eq('user_id', targetUser.id)
        .maybeSingle();

      if (existingMember) {
        return NextResponse.json({
          error: `User is already a team member (status: ${existingMember.status})`
        }, { status: 409 });
      }

      // User exists - create invitation linked to their user_id
      const { data: newTeamMember, error: insertError } = await supabase
        .from('company_team_members')
        .insert({
          company_id: invitingMember.company_id,
          user_id: targetUser.id,
          role,
          invited_by: user.id,
          status: 'pending',
          invited_email: email
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting team member:', insertError);
        throw insertError;
      }

      // TODO: Send email notification to targetUser.email

      return NextResponse.json({
        ...newTeamMember,
        message: 'Invitation sent successfully'
      }, { status: 201 });
    }

    // User doesn't exist yet - create pending invitation by email only
    const { data: newTeamMember, error: insertError } = await supabase
      .from('company_team_members')
      .insert({
        company_id: invitingMember.company_id,
        user_id: null, // Will be filled when user signs up
        role,
        invited_by: user.id,
        status: 'pending',
        invited_email: email
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting team member:', insertError);
      throw insertError;
    }

    // TODO: Send email notification to email address

    return NextResponse.json({
      ...newTeamMember,
      message: 'Invitation sent successfully. User will be notified when they sign up.'
    }, { status: 201 });
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json({
      error: 'Failed to invite team member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
