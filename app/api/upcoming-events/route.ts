// app/api/upcoming-events/route.ts
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // First, get the registrations for this user
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('volunteer_id', userId);

    if (regError) {
      console.error('Error fetching registrations:', regError);
      throw regError;
    }

    // If no registrations, return empty array
    if (!registrations || registrations.length === 0) {
      return NextResponse.json([]);
    }

    // Get the event IDs
    const eventIds = registrations.map(r => r.event_id);

    // Now fetch the actual events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    // Format the events
    const formattedEvents = events.map(event => {
      const eventDate = new Date(event.event_date);
      const startTime = event.start_time || '09:00:00';
      const endTime = event.end_time || '17:00:00';
      
      const startDateTime = new Date(eventDate);
      const [startHour, startMin] = startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0);
      
      const endDateTime = new Date(eventDate);
      const [endHour, endMin] = endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0);

      return {
        id: event.id,
        title: event.title,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        location: event.location,
        points: event.points,
        category: event.category,
      };
    });

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch upcoming events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
