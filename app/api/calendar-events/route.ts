// app/api/calendar-events/route.ts
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json({ error: 'Start and end dates required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', start)
      .lte('event_date', end)
      .eq('status', 'active')
      .order('event_date', { ascending: true });

    if (error) throw error;

    const events = data.map(event => {
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

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}