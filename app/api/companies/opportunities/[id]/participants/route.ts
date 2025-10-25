// @ts-nocheck
// app/api/companies/opportunities/[id]/participants/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface ApprovalRequest {
  registrationIds: string[];
  action: 'approve' | 'reject';
}

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const eventId = params.id;
  const supabase = await createClient();

  console.log('GET participants - Event ID:', eventId);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is a member of the company that owns the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('company_id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data: teamMember, error: teamMemberError } = await supabase
      .from('company_team_members')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('company_id', event.company_id)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch registrations first (without join to avoid RLS issues)
    const { data: registrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('id, status, registration_date, volunteer_id')
      .eq('event_id', eventId);

    console.log('Registrations query result:', {
      eventId,
      count: registrations?.length,
      error: registrationsError,
      data: registrations
    });

    if (registrationsError) {
      console.error('Error fetching registrations:', registrationsError);
      return NextResponse.json({
        error: 'Failed to fetch registrations',
        details: registrationsError.message
      }, { status: 500 });
    }

    if (!registrations || registrations.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch volunteers separately
    const volunteerIds = registrations.map(r => r.volunteer_id).filter(Boolean);

    const { data: volunteers, error: volunteersError } = await supabase
      .from('volunteers')
      .select('id, username, email, user_id')
      .in('id', volunteerIds);

    console.log('Volunteers query result:', {
      count: volunteers?.length,
      error: volunteersError,
      data: volunteers
    });

    // Format the participants data
    const formatted = registrations.map(registration => {
      const volunteer = volunteers?.find(v => v.id === registration.volunteer_id);
      return {
        id: volunteer?.id || registration.volunteer_id,
        registrationId: registration.id,
        name: volunteer?.username || 'Unknown Volunteer',
        email: volunteer?.email || 'No email',
        status: registration.status,
        registrationDate: registration.registration_date
      };
    });

    console.log('Final formatted participants:', formatted);

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const eventId = params.id;
  const supabase = await createClient();

  console.log('PATCH participants - Event ID:', eventId);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is a member of the company that owns the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('company_id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data: teamMember, error: teamMemberError } = await supabase
      .from('company_team_members')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('company_id', event.company_id)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse the request body
    const body: ApprovalRequest = await request.json();
    const { registrationIds, action } = body;

    console.log('Approval request:', { registrationIds, action, eventId });

    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return NextResponse.json({ error: 'Invalid registration IDs' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

    // First, check if the registrations exist and their current status
    const { data: existingRegistrations, error: checkError } = await supabase
      .from('event_registrations')
      .select('id, status, event_id')
      .in('id', registrationIds);

    console.log('Existing registrations before update:', existingRegistrations);
    console.log('Check error:', checkError);

    // Update registration status
    const newStatus = action === 'approve' ? 'registered' : 'cancelled';
    const { data: updateData, error: updateError } = await supabase
      .from('event_registrations')
      .update({ status: newStatus })
      .in('id', registrationIds)
      .select();

    console.log('Update result:', { updateData, updateError, newStatus });

    if (updateError) {
      console.error('Error updating registrations:', updateError);
      return NextResponse.json({
        error: 'Failed to update registrations',
        details: updateError.message
      }, { status: 500 });
    }

    // Verify the update worked
    const { data: verifyData } = await supabase
      .from('event_registrations')
      .select('id, status')
      .in('id', registrationIds);

    console.log('Verified registrations after update:', verifyData);

    // If approved, increment the participant count for each registration
    if (action === 'approve') {
      console.log(`Incrementing participant count ${registrationIds.length} times`);
      for (let i = 0; i < registrationIds.length; i++) {
        const { data: rpcData, error: rpcError } = await supabase.rpc('increment_event_participants', { event_uuid: eventId });
        console.log(`Increment ${i + 1}:`, { rpcData, rpcError });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${registrationIds.length} registration(s)`,
      updatedCount: registrationIds.length,
      debug: {
        before: existingRegistrations,
        after: verifyData
      }
    });
  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}