"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Check, X, Loader2 } from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

interface Invitation {
  id: string;
  company_id: string;
  role: 'admin' | 'member';
  status: string;
  invited_at: string;
  invited_email: string;
  companies: {
    id: string;
    company_name: string;
    email: string;
    industry: string;
    website: string;
  };
}

interface InvitationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InvitationsDialog({ open, onOpenChange }: InvitationsDialogProps) {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchInvitations();
    }
  }, [open]);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.get('/api/companies/invitations');
      setInvitations(data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      await ApiClient.post(`/api/companies/invitations/${invitationId}`);

      // Refresh and redirect to company dashboard
      router.refresh();
      router.push('/company-dashboard');
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      alert('Failed to accept invitation. Please try again.');
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      await ApiClient.delete(`/api/companies/invitations/${invitationId}`);

      // Remove from list
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      alert('Failed to decline invitation. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            Team Invitations
          </DialogTitle>
          <DialogDescription>
            You have pending invitations to join company teams
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No pending invitations
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => {
                const isProcessing = processingId === invitation.id;

                return (
                  <Card key={invitation.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {invitation.companies.company_name}
                          </h4>
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            {invitation.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {invitation.companies.industry}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Invited {new Date(invitation.invited_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleAccept(invitation.id)}
                        disabled={isProcessing}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        size="sm"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDecline(invitation.id)}
                        disabled={isProcessing}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {invitations.length > 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              I'll decide later
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
