"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = (type: string) => {
    // Handle login logic here
    console.log(`Logging in as ${type} with email: ${email}`);
    // In a real app, you would make an API call here
  };
  
  return (
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
                  />
                </div>
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleLogin('volunteer')}
                >
                  Login
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
                  />
                </div>
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleLogin('company')}
                >
                  Login
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600 dark:text-gray-400">
            Don't have an account?
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
  );
}