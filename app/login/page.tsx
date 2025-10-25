"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import InvitationsDialog from '@/components/InvitationsDialog';
import { ApiClient } from '@/lib/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const supabase = createClient();

  const handleLogin = async (type: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw new Error(error.message || 'Login failed');
      }

      // Check user's role and redirect accordingly
      const userId = data.user?.id;

      if (!userId) {
        throw new Error('No user ID returned');
      }

      // Check for pending invitations first (check both user_id and email)
      const { data: pendingInvitations } = await supabase
        .from('company_team_members')
        .select(`
          id,
          company_id,
          role,
          status,
          invited_at,
          invited_email,
          companies (
            id,
            company_name,
            email,
            industry
          )
        `)
        .or(`user_id.eq.${userId},invited_email.eq.${email}`)
        .eq('status', 'pending');

      if (pendingInvitations && pendingInvitations.length > 0) {
        // Show invitations dialog
        console.log('Found pending invitations:', pendingInvitations);
        setLoading(false);
        setShowInvitations(true);
        return;
      }

      // Check if user is part of a company (accepted status)
      const { data: teamMemberData } = await supabase
        .from('company_team_members')
        .select('company_id, role, status')
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .maybeSingle();

      if (teamMemberData) {
        // User is part of a company → redirect to company dashboard
        console.log('Redirecting to company dashboard');
        router.push('/company-dashboard');
        return;
      }

      // If volunteer type was selected and no company association
      if (type === 'volunteer') {
        console.log('Redirecting to volunteer dashboard');
        router.push('/volunteer-dashboard');
        return;
      }

      // Default: redirect to home
      console.log('Redirecting to home');
      router.push('/');

    } catch (err: any) {
      console.error('Login error:', err);
      alert(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <InvitationsDialog open={showInvitations} onOpenChange={setShowInvitations} />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-emerald-600">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="volunteer" className="mb-6">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="volunteer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Volunteer</span>
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Company</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="volunteer">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="volunteer-email">Email</Label>
                  <Input
                    id="volunteer-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="volunteer-password">Password</Label>
                    <a className="text-sm text-emerald-600 hover:text-emerald-700 cursor-pointer">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="volunteer-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleLogin('volunteer')}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="company">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Company Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="company-password">Password</Label>
                    <a className="text-sm text-emerald-600 hover:text-emerald-700 cursor-pointer">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="company-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleLogin('company')}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push('/volunteer-signup')}>
              <User className="h-4 w-4" />
              <span>Volunteer</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>

            <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push('/company-signup')}>
              <Building2 className="h-4 w-4" />
              <span>Company</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
    </>
  );
}
