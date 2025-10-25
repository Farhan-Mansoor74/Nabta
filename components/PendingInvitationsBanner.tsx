"use client";

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Building2, Bell } from 'lucide-react';
import InvitationsDialog from './InvitationsDialog';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';

export default function PendingInvitationsBanner() {
  const { user } = useUser();
  const [hasInvitations, setHasInvitations] = useState(false);
  const [invitationCount, setInvitationCount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkInvitations = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('company_team_members')
        .select('id')
        .or(`user_id.eq.${user.id},invited_email.eq.${user.email}`)
        .eq('status', 'pending');

      if (data && data.length > 0) {
        setHasInvitations(true);
        setInvitationCount(data.length);
      }
    };

    checkInvitations();
  }, [user]);

  if (!hasInvitations) return null;

  return (
    <>
      <Alert className="mb-6 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800">
        <Bell className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-900 dark:text-emerald-100">
          Team Invitation{invitationCount > 1 ? 's' : ''} Pending
        </AlertTitle>
        <AlertDescription className="text-emerald-800 dark:text-emerald-200">
          You have {invitationCount} pending team invitation{invitationCount > 1 ? 's' : ''}.{' '}
          <Button
            variant="link"
            className="p-0 h-auto text-emerald-600 dark:text-emerald-400 font-semibold"
            onClick={() => setShowDialog(true)}
          >
            View invitation{invitationCount > 1 ? 's' : ''}
          </Button>
        </AlertDescription>
      </Alert>

      <InvitationsDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            // Recheck invitations when dialog closes
            setHasInvitations(false);
          }
        }}
      />
    </>
  );
}
