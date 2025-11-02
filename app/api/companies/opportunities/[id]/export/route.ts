// @ts-nocheck
// app/api/companies/opportunities/[id]/export/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const eventId = params.id;
  const supabase = await createClient();

  console.log('GET export - Event ID:', eventId);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify user has access to this event
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('company_team_members')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('company_id', event.company_id)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch registrations with volunteer data
    const { data: registrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('id, status, registration_date, attendance_confirmed_at, actual_hours, hours_notes, volunteer_id')
      .eq('event_id', eventId);

    if (registrationsError) {
      console.error('Error fetching registrations:', registrationsError);
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
    }

    // Fetch volunteer details
    const volunteerIds = registrations?.map(r => r.volunteer_id).filter(Boolean) || [];
    let volunteers: any[] = [];

    if (volunteerIds.length > 0) {
      const { data: volunteersData, error: volunteersError } = await supabase
        .from('volunteers')
        .select('id, username, email, total_points, total_hours')
        .in('id', volunteerIds);

      if (!volunteersError && volunteersData) {
        volunteers = volunteersData;
      }
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Event Details
    const eventDetails = [
      ['Event Details', ''],
      ['Title', event.title || ''],
      ['Category', event.category || ''],
      ['Location', event.location || ''],
      ['Date', event.event_date || ''],
      ['Start Time', event.start_time || ''],
      ['End Time', event.end_time || ''],
      ['Status', event.status || ''],
      ['Max Participants', event.max_participants || 0],
      ['Current Participants', event.current_participants || 0],
      ['Points', event.points || 0],
      ['Featured', event.featured ? 'Yes' : 'No'],
      ['Finalized', event.finalized ? 'Yes' : 'No'],
      ['Finalized At', event.finalized_at ? new Date(event.finalized_at).toLocaleString() : 'Not finalized'],
      ['Views', event.views || 0],
      ['Description', event.description || ''],
    ];
    const eventSheet = XLSX.utils.aoa_to_sheet(eventDetails);
    XLSX.utils.book_append_sheet(workbook, eventSheet, 'Event Details');

    // Sheet 2: Volunteer Data
    const volunteerData = [
      ['Name', 'Email', 'Status', 'Hours Worked', 'Points Earned', 'Notes', 'Total Hours (All Time)', 'Total Points (All Time)']
    ];

    registrations?.forEach(reg => {
      const volunteer = volunteers.find(v => v.id === reg.volunteer_id);
      const pointsEarned = reg.actual_hours ? Math.round(reg.actual_hours * 10) : 0;

      volunteerData.push([
        volunteer?.username || 'Unknown',
        volunteer?.email || '',
        reg.status || 'unknown',
        reg.actual_hours !== null && reg.actual_hours !== undefined ? reg.actual_hours : 'N/A',
        pointsEarned,
        reg.hours_notes || '',
        volunteer?.total_hours || 0,
        volunteer?.total_points || 0
      ]);
    });

    const volunteerSheet = XLSX.utils.aoa_to_sheet(volunteerData);
    XLSX.utils.book_append_sheet(workbook, volunteerSheet, 'Volunteers');

    // Sheet 3: Registration Timeline
    const timelineData = [
      ['Name', 'Email', 'Registration Date', 'Approval/Status Change', 'Status']
    ];

    registrations?.forEach(reg => {
      const volunteer = volunteers.find(v => v.id === reg.volunteer_id);

      timelineData.push([
        volunteer?.username || 'Unknown',
        volunteer?.email || '',
        reg.registration_date ? new Date(reg.registration_date).toLocaleString() : 'Unknown',
        reg.attendance_confirmed_at ? new Date(reg.attendance_confirmed_at).toLocaleString() : 'Not confirmed',
        reg.status || 'unknown'
      ]);
    });

    const timelineSheet = XLSX.utils.aoa_to_sheet(timelineData);
    XLSX.utils.book_append_sheet(workbook, timelineSheet, 'Timeline');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create filename
    const filename = `event_${event.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Return the Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting event data:', error);
    return NextResponse.json({
      error: 'Failed to export event data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
