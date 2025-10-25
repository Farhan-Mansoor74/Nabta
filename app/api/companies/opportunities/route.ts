import { createClient } from '@/lib/supabase/server';
import { NextResponse, NextRequest } from 'next/server';

// GET - Get all opportunities/events for the authenticated user's company
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
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

    // Fetch all events for this company with event_details
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        *,
        event_details (
          required_skills,
          preferred_skills,
          materials_provided,
          bring_your_own,
          accessibility_info,
          parking_info,
          public_transport_info,
          expected_participants,
          community_impact_level,
          impact_metrics
        )
      `)
      .eq('company_id', teamMember.company_id)
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Database error:', eventsError);
      throw eventsError;
    }

    return NextResponse.json(events || []);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({
      error: 'Failed to fetch events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create a new event/opportunity
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's company
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('company_team_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json({ error: 'User is not part of any company' }, { status: 403 });
    }

    // Optional: Check permissions (only admin can create events)
    // if (teamMember.role !== 'admin') {
    //   return NextResponse.json({ error: 'Only admins can create events' }, { status: 403 });
    // }

    const body = await request.json();

    // Extract event data from body
    const {
      title,
      description,
      category,
      location,
      event_date,
      start_time,
      end_time,
      max_participants,
      image_url,
      points,
      status = 'draft'
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create the event
    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert({
        company_id: teamMember.company_id,
        created_by: user.id,
        title,
        description,
        category,
        location,
        event_date,
        start_time,
        end_time,
        max_participants,
        current_participants: 0,
        image_url,
        points: points || 0,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting event:', insertError);
      throw insertError;
    }

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({
      error: 'Failed to create event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
