/**
 * Volunteer Utility Functions
 * Handles volunteer points and hours calculations
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calculate points based on hours worked
 * Standard rate: 10 points per hour
 */
export function calculatePoints(hours: number): number {
  return Math.round(hours * 10);
}

/**
 * Update volunteer's total hours and points
 * This should be called when finalizing event attendance
 */
export async function updateVolunteerStats(
  supabase: SupabaseClient,
  volunteerId: string,
  hoursToAdd: number,
  pointsToAdd: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch current volunteer stats
    const { data: volunteer, error: fetchError } = await supabase
      .from('volunteers')
      .select('total_hours, total_points')
      .eq('id', volunteerId)
      .single();

    if (fetchError) {
      console.error('Error fetching volunteer stats:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Calculate new totals
    const newTotalHours = (volunteer.total_hours || 0) + hoursToAdd;
    const newTotalPoints = (volunteer.total_points || 0) + pointsToAdd;

    // Update volunteer stats
    const { error: updateError } = await supabase
      .from('volunteers')
      .update({
        total_hours: newTotalHours,
        total_points: newTotalPoints,
        updated_at: new Date().toISOString()
      })
      .eq('id', volunteerId);

    if (updateError) {
      console.error('Error updating volunteer stats:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating volunteer stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Batch update multiple volunteers' stats
 */
export async function batchUpdateVolunteerStats(
  supabase: SupabaseClient,
  updates: Array<{ volunteerId: string; hours: number; points: number }>
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (const update of updates) {
    const result = await updateVolunteerStats(
      supabase,
      update.volunteerId,
      update.hours,
      update.points
    );

    if (!result.success && result.error) {
      errors.push(`Failed to update volunteer ${update.volunteerId}: ${result.error}`);
    }
  }

  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Validate hours value
 */
export function validateHours(hours: number): { valid: boolean; error?: string } {
  if (hours < 0) {
    return { valid: false, error: 'Hours cannot be negative' };
  }
  if (hours > 24) {
    return { valid: false, error: 'Hours cannot exceed 24 for a single event' };
  }
  if (!Number.isFinite(hours)) {
    return { valid: false, error: 'Hours must be a valid number' };
  }
  return { valid: true };
}

/**
 * Format hours for display
 */
export function formatHours(hours: number): string {
  return hours.toFixed(2) + 'h';
}
