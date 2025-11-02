// app/api/recommended-events/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '3');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get volunteer profile
    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let registeredIds: string[] = [];

    if (volunteer) {
      // Get events user has already registered for
      const { data: registeredEvents } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('volunteer_id', volunteer.id);

      registeredIds = registeredEvents?.map(r => r.event_id) || [];
    }

    // Build query for events
    let query = supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .eq('status', 'active')
      .order('event_date', { ascending: true })
      .limit(limit);

    // Only exclude registered events if user has registrations
    if (registeredIds.length > 0) {
      query = query.not('id', 'in', `(${registeredIds.join(',')})`);
    }

    const { data, error } = await query;

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
      image_url: event.image_url,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching recommended events:', error);
    return NextResponse.json({ error: 'Failed to fetch recommended events' }, { status: 500 });
  }
}