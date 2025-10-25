import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST - Accept an invitation
export async function POST(
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

    console.log('Accepting invitation:', { id, userId: user.id, email: user.email });

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('company_team_members')
      .select('*')
      .eq('id', id)
      .or(`user_id.eq.${user.id},invited_email.eq.${user.email}`)
      .eq('status', 'pending')
      .single();

    console.log('Invitation found:', invitation, 'Error:', invitationError);

    if (invitationError || !invitation) {
      return NextResponse.json({
        error: 'Invitation not found or already processed'
      }, { status: 404 });
    }

    // Update the invitation to accepted and link to user
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('company_team_members')
      .update({
        user_id: user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    console.log('Updated invitation:', updatedInvitation, 'Error:', updateError);

    if (updateError) {
      console.error('Error accepting invitation:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      ...updatedInvitation,
      message: 'Invitation accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({
      error: 'Failed to accept invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Decline an invitation
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

    console.log('Declining invitation:', { id, userId: user.id, email: user.email });

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('company_team_members')
      .select('*')
      .eq('id', id)
      .or(`user_id.eq.${user.id},invited_email.eq.${user.email}`)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json({
        error: 'Invitation not found or already processed',
        details: invitationError?.message
      }, { status: 404 });
    }

    // Update status to declined
    const { error: updateError } = await supabase
      .from('company_team_members')
      .update({
        status: 'declined'
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error declining invitation:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      message: 'Invitation declined successfully'
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json({
      error: 'Failed to decline invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
