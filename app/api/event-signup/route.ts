import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, volunteerId, fullName, email, phone, motivation } = body;

    if (!eventId || !volunteerId) {
      return NextResponse.json({ error: 'Event ID and Volunteer ID required' }, { status: 400 });
    }

    // 1️⃣ Check if already registered
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('volunteer_id', volunteerId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // 2️⃣ Create registration
    const { data: registrationData, error: registrationError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        volunteer_id: volunteerId,
        status: 'registered',
        registration_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (registrationError) throw registrationError;

    // 3️⃣ Increment upcoming_events count
    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('upcoming_events')
      .eq('id', volunteerId)
      .single();

    const newCount = (volunteer?.upcoming_events || 0) + 1;

    const { error: updateError } = await supabase
      .from('volunteers')
      .update({ upcoming_events: newCount })
      .eq('id', volunteerId);

    if (updateError) {
      console.error('Error updating upcoming_events:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for event',
      registration: registrationData,
    });
  } catch (error) {
    console.error('Error signing up for event:', error);
    return NextResponse.json({ error: 'Failed to sign up for event' }, { status: 500 });
  }
}