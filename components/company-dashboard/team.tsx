'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Crown, User, Loader2, UserPlus, Trash2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import { useUser } from '@/hooks/useUser';
import InviteMemberDialog from './InviteMemberDialog';

interface TeamMember {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  invited_email?: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  accepted_at?: string;
  avatar?: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Crown className="h-3 w-3" />;
    default:
      return <User className="h-3 w-3" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export default function CompanyTeam() {
  const { user } = useUser();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());

  // Get current user's role
  const currentUserMember = teamMembers.find(m => m.user_id === user?.id);
  const isAdmin = currentUserMember?.role === 'admin';

  // Separate accepted and pending members
  const acceptedMembers = teamMembers.filter(m => m.status === 'accepted');
  const pendingMembers = teamMembers.filter(m => m.status === 'pending');

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.get('/api/companies/team');
      setTeamMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    setUpdatingRoles(prev => new Set(prev).add(memberId));
    try {
      await ApiClient.patch(`/api/companies/team/${memberId}`, { role: newRole });
      await fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setUpdatingRoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    setUpdatingRoles(prev => new Set(prev).add(memberId));
    try {
      await ApiClient.delete(`/api/companies/team/${memberId}`);
      await fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setUpdatingRoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-lg">Team Members</CardTitle>
              </div>
              {isAdmin && (
                <Button
                  onClick={() => setInviteDialogOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 dark:text-red-400">
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Team Members */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Active Members ({acceptedMembers.length})
                  </h4>
                  {acceptedMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                      No team members yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {acceptedMembers.map((member) => {
                        const isCurrentUser = member.user_id === user?.id;
                        const isUpdating = updatingRoles.has(member.id);

                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                                  {member.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {member.name || 'Name not set'}
                                  </p>
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="text-xs">You</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAdmin && !isCurrentUser ? (
                                <>
                                  <Select
                                    value={member.role}
                                    onValueChange={(value: 'admin' | 'member') => handleRoleChange(member.id, value)}
                                    disabled={isUpdating}
                                  >
                                    <SelectTrigger className="w-[120px] h-8">
                                      <SelectValue>
                                        <div className="flex items-center gap-1">
                                          {getRoleIcon(member.role)}
                                          <span className="text-xs capitalize">{member.role}</span>
                                        </div>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">
                                        <div className="flex items-center gap-2">
                                          <Crown className="h-3 w-3" />
                                          <span>Admin</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="member">
                                        <div className="flex items-center gap-2">
                                          <User className="h-3 w-3" />
                                          <span>Member</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMember(member.id)}
                                    disabled={isUpdating}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <Badge className={`${getRoleColor(member.role)} flex items-center gap-1`}>
                                  {getRoleIcon(member.role)}
                                  <span className="text-xs capitalize">{member.role}</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pending Invitations */}
                {pendingMembers.length > 0 && (
                  <div className="space-y-3 pt-3 border-t dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      Pending Invitations ({pendingMembers.length})
                    </h4>
                    <div className="space-y-2">
                      {pendingMembers.map((member) => {
                        const isUpdating = updatingRoles.has(member.id);
                        const hasAccount = !!member.user_id; // Check if user_id exists
                        const displayEmail = member.email || member.invited_email || 'No email';

                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <Avatar className="h-10 w-10 opacity-60">
                                <AvatarFallback className="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
                                  {displayEmail.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {member.name || displayEmail.split('@')[0]}
                                  </p>
                                  {hasAccount ? (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                      Has Account
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                      New User
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {displayEmail}
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                                  Invited {new Date(member.invited_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                {member.role}
                              </Badge>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={isUpdating}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title="Cancel invitation"
                                >
                                  {isUpdating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={fetchTeam}
      />
    </>
  );
}