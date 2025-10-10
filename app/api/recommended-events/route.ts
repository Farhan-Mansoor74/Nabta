// app/api/recommended-events/route.ts
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '3');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get events user hasn't registered for
    const { data: registeredEvents } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('volunteer_id', userId);

    const registeredIds = registeredEvents?.map(r => r.event_id) || [];

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .eq('status', 'active')
      .not('id', 'in', `(${registeredIds.join(',')})`)
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) throw error;

    const events = data.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.event_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      points: event.points || 0,
      location: event.location || 'TBA',
      category: event.category,
      eventDate: event.event_date,
      startTime: event.start_time,
      endTime: event.end_time,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching recommended events:', error);
    return NextResponse.json({ error: 'Failed to fetch recommended events' }, { status: 500 });
  }
}