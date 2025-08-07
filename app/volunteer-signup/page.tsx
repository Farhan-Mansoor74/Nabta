"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, User } from 'lucide-react';
import { signUpVolunteer } from '@/lib/utils';

export default function VolunteerSignup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: any) => {
    setFormData(prev => ({ ...prev, agreeTerms: checked }));
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    try {
      const { error } = await signUpVolunteer({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      if (error) {
        alert(error.message || 'Signup failed.');
      } else {
        alert('Volunteer registered successfully! Please check your email to verify your account.');
      }
    } catch (err) {
      alert('Signup failed.');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 mr-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center">
              <User className="mr-2 h-5 w-5" /> Volunteer Sign Up
            </CardTitle>
          </div>
          <CardDescription>
            Create your volunteer account to start making an impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeTerms}
              onCheckedChange={handleCheckboxChange}
            />
            <Label
              htmlFor="terms"
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              I agree to the{" "}
              <a className="text-emerald-600 hover:text-emerald-700 cursor-pointer">
                Terms and Conditions
              </a>
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmit}
          >
            Create Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}