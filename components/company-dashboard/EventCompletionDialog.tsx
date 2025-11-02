"use client";

import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  Loader2,
  Minus,
  Plus,
  Trophy,
  XCircle
} from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';
import { calculateEventDuration, formatDuration } from '@/lib/eventUtils';
import { calculatePoints } from '@/lib/volunteerUtils';

interface VolunteerAttendance {
  registrationId: string;
  volunteerId: string;
  name: string;
  email: string;
  status: 'registered' | 'attended' | 'no-show';
  defaultHours: number;
  actualHours: number;
  notes: string;
}

interface EventCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  eventStartTime?: string;
  eventEndTime?: string;
  onComplete?: () => void;
}

export default function EventCompletionDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  eventStartTime,
  eventEndTime,
  onComplete
}: EventCompletionDialogProps) {
  const [volunteers, setVolunteers] = useState<VolunteerAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const defaultDuration = useMemo(() => {
    if (eventStartTime && eventEndTime) {
      return calculateEventDuration(eventStartTime, eventEndTime);
    }
    return 8; // Default to 8 hours
  }, [eventStartTime, eventEndTime]);

  // Fetch registered volunteers when dialog opens
  useEffect(() => {
    if (open && eventId) {
      fetchRegisteredVolunteers();
    }
  }, [open, eventId]);

  const fetchRegisteredVolunteers = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ApiClient.get(`/api/companies/opportunities/${eventId}/participants`);

      // Filter only registered volunteers (those approved pre-event)
      const registeredOnly = data.filter((p: any) => p.status === 'registered');

      // Map to attendance format with default hours
      const attendanceData: VolunteerAttendance[] = registeredOnly.map((p: any) => ({
        registrationId: p.registrationId,
        volunteerId: p.id,
        name: p.name,
        email: p.email,
        status: 'registered',
        defaultHours: defaultDuration,
        actualHours: defaultDuration,
        notes: ''
      }));

      setVolunteers(attendanceData);
    } catch (err) {
      console.error('Error fetching volunteers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  };

  const updateVolunteerHours = (registrationId: string, hours: number) => {
    setVolunteers(prev =>
      prev.map(v =>
        v.registrationId === registrationId
          ? { ...v, actualHours: Math.max(0, Math.min(24, hours)) }
          : v
      )
    );
  };

  const updateVolunteerNotes = (registrationId: string, notes: string) => {
    setVolunteers(prev =>
      prev.map(v =>
        v.registrationId === registrationId ? { ...v, notes } : v
      )
    );
  };

  const markAsAttended = (registrationId: string) => {
    setVolunteers(prev =>
      prev.map(v =>
        v.registrationId === registrationId ? { ...v, status: 'attended' } : v
      )
    );
  };

  const markAsNoShow = (registrationId: string) => {
    setVolunteers(prev =>
      prev.map(v =>
        v.registrationId === registrationId
          ? { ...v, status: 'no-show', actualHours: 0 }
          : v
      )
    );
  };

  const markAllAsAttended = () => {
    setVolunteers(prev => prev.map(v => ({ ...v, status: 'attended' })));
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    setError(null);

    try {
      // Prepare attendance data
      const attendanceData = volunteers.map(v => ({
        registrationId: v.registrationId,
        volunteerId: v.volunteerId,
        status: v.status,
        actualHours: v.status === 'attended' ? v.actualHours : 0,
        notes: v.notes || undefined
      }));

      await ApiClient.post(`/api/companies/opportunities/${eventId}/finalize`, {
        attendanceData
      });

      // Success!
      if (onComplete) {
        onComplete();
      }

      onOpenChange(false);
    } catch (err) {
      console.error('Error finalizing event:', err);
      setError(err instanceof Error ? err.message : 'Failed to finalize event');
    } finally {
      setFinalizing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/companies/opportunities/${eventId}/export`);
      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event_${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting:', err);
      setError('Failed to export event data');
    } finally {
      setExporting(false);
    }
  };

  const attendedCount = volunteers.filter(v => v.status === 'attended').length;
  const noShowCount = volunteers.filter(v => v.status === 'no-show').length;
  const pendingCount = volunteers.filter(v => v.status === 'registered').length;
  const totalHours = volunteers
    .filter(v => v.status === 'attended')
    .reduce((sum, v) => sum + v.actualHours, 0);
  const totalPoints = volunteers
    .filter(v => v.status === 'attended')
    .reduce((sum, v) => sum + calculatePoints(v.actualHours), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Finalize Event Attendance — {eventTitle}
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Review and adjust volunteer hours, mark attendance, and finalize the event.
            {eventStartTime && eventEndTime && (
              <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400">
                Default: {formatDuration(defaultDuration)}
              </span>
            )}
          </p>
          {error && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{attendedCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Attended</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{noShowCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">No-Show</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalHours.toFixed(1)}h</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
              <Trophy className="h-5 w-5" />
              {totalPoints}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Points</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsAttended}
            disabled={loading || finalizing}
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Mark All Attended
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Export to Excel
          </Button>
          <div className="flex-1" />
          {pendingCount > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
              {pendingCount} pending
            </Badge>
          )}
        </div>

        {/* Volunteers Table */}
        <div className="flex-1 overflow-auto border rounded-lg">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading volunteers...</p>
            </div>
          ) : volunteers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No registered volunteers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableHead>Volunteer</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteers.map((v) => (
                  <TableRow key={v.registrationId}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{v.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{v.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => updateVolunteerHours(v.registrationId, v.actualHours - 0.5)}
                          disabled={v.status === 'no-show'}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={v.actualHours}
                          onChange={(e) => updateVolunteerHours(v.registrationId, parseFloat(e.target.value) || 0)}
                          disabled={v.status === 'no-show'}
                          className="w-20 h-7 text-center text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => updateVolunteerHours(v.registrationId, v.actualHours + 0.5)}
                          disabled={v.status === 'no-show'}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-gray-500 ml-1">h</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                        <Trophy className="h-4 w-4" />
                        {calculatePoints(v.actualHours)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="e.g., Arrived late"
                        value={v.notes}
                        onChange={(e) => updateVolunteerNotes(v.registrationId, e.target.value)}
                        disabled={v.status === 'no-show'}
                        className="h-7 text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      {v.status === 'attended' && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Attended
                        </Badge>
                      )}
                      {v.status === 'no-show' && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          No-Show
                        </Badge>
                      )}
                      {v.status === 'registered' && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        {v.status !== 'attended' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                            onClick={() => markAsAttended(v.registrationId)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {v.status !== 'no-show' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400"
                            onClick={() => markAsNoShow(v.registrationId)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={finalizing}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleFinalize}
            disabled={finalizing || pendingCount === volunteers.length}
          >
            {finalizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalize Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
