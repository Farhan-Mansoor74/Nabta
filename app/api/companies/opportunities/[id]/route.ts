// @ts-nocheck
// app/api/companies/opportunities/[id]/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

async function checkUserPermission(supabase: any, userId: string, eventId: string): Promise<{ authorized: boolean; companyId?: string }> {
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('company_id')
        .eq('id', eventId)
        .single();

    if (eventError || !event) {
        return { authorized: false };
    }

    const { data: teamMember, error: teamMemberError } = await supabase
        .from('company_team_members')
        .select('role')
        .eq('user_id', userId)
        .eq('company_id', event.company_id)
        .single();

    if (teamMemberError || !teamMember) {
        return { authorized: false };
    }

    // For now, any team member can edit/delete. Add role checks here if needed.
    // e.g., if (!['admin', 'manager'].includes(teamMember.role)) return { authorized: false };

    return { authorized: true, companyId: event.company_id };
}

// GET - Get a specific opportunity
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    try {
        const { data: opportunity, error } = await supabase
            .from('events')
            .select(`
                *,
                event_details (
                    required_skills,
                    preferred_skills,
                    materials_provided,
                    bring_your_own,
                    accessibility_info,
                    parking_info,
                    public_transport_info,
                    expected_participants,
                    community_impact_level,
                    impact_metrics
                )
            `)
            .eq('id', params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(opportunity);
    } catch (error) {
        console.error('Error fetching opportunity:', error);
        return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
    }
}

// PUT - Update an opportunity
// @ts-nocheck
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { authorized } = await checkUserPermission(supabase, user.id, params.id);
        if (!authorized) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        // ... (rest of the update logic is largely the same)
        const { data: updatedOpportunity, error } = await supabase
            .from('events')
            .update({ ...body, updated_at: new Date().toISOString() })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(updatedOpportunity);
    } catch (error) {
        console.error('Error updating opportunity:', error);
        return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
    }
}

// DELETE - Delete an opportunity
// @ts-nocheck
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { authorized } = await checkUserPermission(supabase, user.id, params.id);
        if (!authorized) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Opportunity deleted successfully' });
    } catch (error) {
        console.error('Error deleting opportunity:', error);
        return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
    }
}