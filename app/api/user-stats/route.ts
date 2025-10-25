// app/api/user-stats/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Try to get volunteer profile from complete_user_profiles view
    const { data, error } = await supabase
      .from('complete_user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error querying complete_user_profiles:', error);
    }

    // If no profile found, try to create one automatically
    if (!data) {
      console.log('No volunteer profile found for user, attempting to create...');

      // Get user info from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!userError && user) {
        const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Volunteer';
        const email = user.email || '';

        // Call the create_volunteer_profile function
        const { data: newVolunteerId, error: createError } = await supabase
          .rpc('create_volunteer_profile', {
            user_id_param: userId,
            username_param: username,
            email_param: email
          });

        if (!createError && newVolunteerId) {
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('complete_user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (newProfile) {
            return NextResponse.json({
              name: newProfile.username || 'User',
              points: newProfile.total_points || 0,
              rank: newProfile.rank || 0,
              eventsCompleted: newProfile.events_completed || 0,
              hoursVolunteered: newProfile.total_hours || 0,
              upcoming: newProfile.upcoming_events || 0,
            });
          }
        }
      }

      // Fallback: return default stats
      return NextResponse.json({
        name: 'User',
        points: 0,
        rank: 0,
        eventsCompleted: 0,
        hoursVolunteered: 0,
        upcoming: 0,
      });
    }

    return NextResponse.json({
      name: data.username || 'User',
      points: data.total_points || 0,
      rank: data.rank || 0,
      eventsCompleted: data.events_completed || 0,
      hoursVolunteered: data.total_hours || 0,
      upcoming: data.upcoming_events || 0,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({
      error: 'Failed to fetch user stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}