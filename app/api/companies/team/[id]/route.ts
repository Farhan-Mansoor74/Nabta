import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Update team member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the requesting user's role
    const { data: requestingMember, error: memberError } = await supabase
      .from('company_team_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    if (memberError || !requestingMember) {
      return NextResponse.json({ error: 'User is not part of any company' }, { status: 403 });
    }

    // Only admins can update roles
    if (requestingMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update team member roles' }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be "admin" or "member"' }, { status: 400 });
    }

    // Update the team member's role
    const { data: updatedMember, error: updateError } = await supabase
      .from('company_team_members')
      .update({ role })
      .eq('id', id)
      .eq('company_id', requestingMember.company_id) // Ensure same company
      .select()
      .single();

    if (updateError) {
      console.error('Error updating team member:', updateError);
      throw updateError;
    }

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({
      error: 'Failed to update team member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the requesting user's role
    const { data: requestingMember, error: memberError } = await supabase
      .from('company_team_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    if (memberError || !requestingMember) {
      return NextResponse.json({ error: 'User is not part of any company' }, { status: 403 });
    }

    // Only admins can remove members
    if (requestingMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can remove team members' }, { status: 403 });
    }

    // Delete the team member (or cancel pending invitation)
    const { error: deleteError } = await supabase
      .from('company_team_members')
      .delete()
      .eq('id', id)
      .eq('company_id', requestingMember.company_id); // Ensure same company

    if (deleteError) {
      console.error('Error deleting team member:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({
      error: 'Failed to remove team member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
