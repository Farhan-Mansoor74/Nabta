import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get pending invitations for the authenticated user
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending invitations for this user's email
    const { data: invitations, error } = await supabase
      .from('company_team_members')
      .select(`
        id,
        company_id,
        role,
        status,
        invited_at,
        invited_email,
        companies (
          id,
          company_name,
          email,
          industry,
          website
        )
      `)
      .or(`user_id.eq.${user.id},invited_email.eq.${user.email}`)
      .eq('status', 'pending')
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }

    return NextResponse.json(invitations || []);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({
      error: 'Failed to fetch invitations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
