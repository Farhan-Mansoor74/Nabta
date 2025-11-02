// @ts-nocheck
// app/api/companies/opportunities/[id]/finalize/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { calculatePoints, validateHours, batchUpdateVolunteerStats } from '@/lib/volunteerUtils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface VolunteerAttendance {
  registrationId: string;
  volunteerId: string;
  status: 'attended' | 'no-show';
  actualHours?: number;
  notes?: string;
}

interface FinalizeRequest {
  attendanceData: VolunteerAttendance[];
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const eventId = params.id;
  const supabase = await createClient();

  console.log('POST finalize - Event ID:', eventId);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is a member of the company that owns the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('company_id, status, finalized')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.finalized) {
      return NextResponse.json({ error: 'Event is already finalized' }, { status: 400 });
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
    const body: FinalizeRequest = await request.json();
    const { attendanceData } = body;

    console.log('Finalization request:', { eventId, attendanceCount: attendanceData.length });

    if (!attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
      return NextResponse.json({ error: 'No attendance data provided' }, { status: 400 });
    }

    // Validate all hours before processing
    const attendedVolunteers = attendanceData.filter(a => a.status === 'attended' && a.actualHours !== undefined);
    for (const attendance of attendedVolunteers) {
      const validation = validateHours(attendance.actualHours!);
      if (!validation.valid) {
        return NextResponse.json({
          error: `Invalid hours for registration ${attendance.registrationId}: ${validation.error}`
        }, { status: 400 });
      }
    }

    // Process each attendance record
    const registrationUpdates: Promise<any>[] = [];
    const volunteerStatsUpdates: Array<{ volunteerId: string; hours: number; points: number }> = [];

    for (const attendance of attendanceData) {
      // Update event_registration
      const updateData: any = {
        status: attendance.status,
        attendance_confirmed_at: new Date().toISOString()
      };

      if (attendance.status === 'attended' && attendance.actualHours !== undefined) {
        updateData.actual_hours = attendance.actualHours;
        updateData.hours_notes = attendance.notes || null;

        // Prepare volunteer stats update
        const points = calculatePoints(attendance.actualHours);
        volunteerStatsUpdates.push({
          volunteerId: attendance.volunteerId,
          hours: attendance.actualHours,
          points
        });
      } else if (attendance.status === 'no-show') {
        updateData.actual_hours = 0;
        updateData.hours_notes = 'Marked as no-show';
      }

      const updatePromise = supabase
        .from('event_registrations')
        .update(updateData)
        .eq('id', attendance.registrationId);

      registrationUpdates.push(updatePromise);
    }

    // Execute all registration updates
    const updateResults = await Promise.all(registrationUpdates);
    const failedUpdates = updateResults.filter(r => r.error);

    if (failedUpdates.length > 0) {
      console.error('Failed registration updates:', failedUpdates);
      return NextResponse.json({
        error: 'Failed to update some registrations',
        details: failedUpdates.map(r => r.error.message)
      }, { status: 500 });
    }

    // Update volunteer stats
    if (volunteerStatsUpdates.length > 0) {
      console.log(`Updating stats for ${volunteerStatsUpdates.length} volunteers`);
      const statsResult = await batchUpdateVolunteerStats(supabase, volunteerStatsUpdates);

      if (!statsResult.success) {
        console.error('Some volunteer stats failed to update:', statsResult.errors);
        // Don't fail the whole operation, but log the errors
      }
    }

    // Mark event as finalized
    const { error: finalizeError } = await supabase
      .from('events')
      .update({
        finalized: true,
        finalized_at: new Date().toISOString(),
        finalized_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (finalizeError) {
      console.error('Error finalizing event:', finalizeError);
      return NextResponse.json({
        error: 'Failed to finalize event',
        details: finalizeError.message
      }, { status: 500 });
    }

    console.log('Event finalized successfully:', eventId);

    return NextResponse.json({
      success: true,
      message: 'Event finalized successfully',
      attendanceProcessed: attendanceData.length,
      volunteerStatsUpdated: volunteerStatsUpdates.length
    });
  } catch (error) {
    console.error('Error finalizing event:', error);
    return NextResponse.json({
      error: 'Failed to finalize event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
