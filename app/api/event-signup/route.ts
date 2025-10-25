// app/api/event-signup/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { eventId, volunteerId, fullName, email, phone, motivation } = body;

    console.log('Event signup request:', { eventId, volunteerId, fullName, email });

    if (!eventId || !volunteerId) {
      return NextResponse.json({ error: 'Event ID and Volunteer ID required' }, { status: 400 });
    }

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log('Auth user:', { user: user?.id, error: userError });

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create volunteer profile
    let volunteerProfile = await supabase
      .from('volunteers')
      .select('id')
      .eq('user_id', volunteerId)
      .maybeSingle();

    console.log('Volunteer profile query result:', volunteerProfile);

    let volunteerProfileId = volunteerProfile.data?.id;

    // If no volunteer profile exists, create one
    if (!volunteerProfileId) {
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Volunteer';
      const userEmail = user.email || '';

      console.log('Creating volunteer profile:', { volunteerId, username, userEmail });

      const { data: newVolunteerId, error: createError } = await supabase
        .rpc('create_volunteer_profile', {
          user_id_param: volunteerId,
          username_param: username,
          email_param: userEmail
        });

      console.log('Create volunteer profile result:', { newVolunteerId, createError });

      if (createError || !newVolunteerId) {
        console.error('Failed to create volunteer profile:', createError);
        return NextResponse.json({
          error: 'Failed to create volunteer profile',
          details: createError?.message || 'Unknown error'
        }, { status: 500 });
      }

      volunteerProfileId = newVolunteerId;
    }

    console.log('Final volunteer profile ID:', volunteerProfileId);

    // Check if already registered
    const { data: existing, error: existingError } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('volunteer_id', volunteerProfileId)
      .maybeSingle();

    console.log('Check existing registration:', { existing, existingError });

    if (existing) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // Create registration with 'pending' status (admin must approve)
    console.log('Creating registration:', {
      event_id: eventId,
      volunteer_id: volunteerProfileId,
      status: 'pending'
    });

    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        volunteer_id: volunteerProfileId,
        status: 'pending',
        registration_date: new Date().toISOString(),
        notes: motivation || null
      })
      .select()
      .single();

    console.log('Registration creation result:', { data, error });

    if (error) {
      console.error('Error creating registration:', error);
      return NextResponse.json({
        error: 'Failed to create registration',
        details: error.message
      }, { status: 500 });
    }

    // Note: Participant count will be incremented when admin approves the registration

    return NextResponse.json({
      success: true,
      message: 'Successfully submitted registration. Awaiting approval from event organizer.',
      registration: data
    });
  } catch (error) {
    console.error('Error signing up for event:', error);
    return NextResponse.json({
      error: 'Failed to sign up for event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}