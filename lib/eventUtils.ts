/**
 * Event Utility Functions
 * Handles event lifecycle logic including auto-completion
 */

export interface Event {
  id: string;
  status: string;
  event_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  finalized?: boolean;
  [key: string]: any;
}

/**
 * Check if an event should be auto-completed
 * Event is auto-completable if:
 * - Status is 'active'
 * - Event has ended (event_date + end_time has passed)
 * - At least 12 hours have passed since event end
 */
export function shouldAutoComplete(event: Event): boolean {
  if (event.status !== 'active') return false;
  if (!event.event_date || !event.end_time) return false;

  try {
    // Combine event_date and end_time to get full datetime
    const eventEndDateTime = new Date(`${event.event_date}T${event.end_time}`);

    // Check if valid date
    if (isNaN(eventEndDateTime.getTime())) {
      console.warn(`Invalid date for event ${event.id}:`, event.event_date, event.end_time);
      return false;
    }

    // Add 12 hours to event end time
    const autoCompleteTime = new Date(eventEndDateTime.getTime() + (12 * 60 * 60 * 1000));

    // Check if current time is past auto-complete time
    const now = new Date();
    return now >= autoCompleteTime;
  } catch (error) {
    console.error(`Error checking auto-complete for event ${event.id}:`, error);
    return false;
  }
}

/**
 * Filter events that should be auto-completed
 */
export function getEventsToAutoComplete(events: Event[]): Event[] {
  return events.filter(shouldAutoComplete);
}

/**
 * Calculate event duration in hours
 */
export function calculateEventDuration(startTime: string, endTime: string): number {
  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    if (endTimeInMinutes <= startTimeInMinutes) {
      return 0;
    }

    const durationInMinutes = endTimeInMinutes - startTimeInMinutes;
    const durationInHours = durationInMinutes / 60;

    // Round to 2 decimal places
    return Math.round(durationInHours * 100) / 100;
  } catch (error) {
    console.error('Error calculating event duration:', error);
    return 0;
  }
}

/**
 * Get formatted duration string
 */
export function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  return `${wholeHours}h ${minutes}m`;
}

/**
 * Check if event needs finalization (completed but not finalized)
 */
export function needsFinalization(event: Event): boolean {
  return event.status === 'completed' && !event.finalized;
}
