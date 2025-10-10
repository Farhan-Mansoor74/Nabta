// app/api/event-signup/route.ts
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, volunteerId, fullName, email, phone, motivation } = body;

    if (!eventId || !volunteerId) {
      return NextResponse.json({ error: 'Event ID and Volunteer ID required' }, { status: 400 });
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('volunteer_id', volunteerId)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // Create registration
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        volunteer_id: volunteerId,
        status: 'registered',
        registration_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully registered for event',
      registration: data 
    });
  } catch (error) {
    console.error('Error signing up for event:', error);
    return NextResponse.json({ error: 'Failed to sign up for event' }, { status: 500 });
  }
}