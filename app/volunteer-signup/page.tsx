"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Building2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';

interface Company {
  id: string;
  company_name: string;
  logo_url?: string;
  signup_description?: string;
  industry?: string;
}

interface FormField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_placeholder?: string;
  is_required: boolean;
  select_options?: string[];
  display_order: number;
}

export default function VolunteerSignup() {
  const [stage, setStage] = useState<'company' | 'details'>(
'company');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [customFields, setCustomFields] = useState<FormField[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({});
  const [signingOut, setSigningOut] = useState(false);

  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      setSigningOut(true);
      alert("You're already signed in. We'll sign you out so you can create a new volunteer account.");
      supabase.auth.signOut().then(() => {
        setSigningOut(false);
      });
    }
  }, [user, loading]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await fetch('/api/companies/public');
      if (!response.ok) throw new Error('Failed to load companies');

      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      alert('Failed to load companies. Please refresh the page.');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCompanySelect = async (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    setSelectedCompany(company);

    try {
      console.log('Fetching form fields for company:', companyId);
      const response = await fetch(`/api/companies/${companyId}/form`);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to load form fields');
      }

      const data = await response.json();
      console.log('Form data received:', data);
      setCustomFields(data.fields || []);
      setStage('details');
    } catch (error) {
      console.error('Error loading form fields:', error);
      alert(`Failed to load form fields: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: any) => {
    setFormData(prev => ({ ...prev, agreeTerms: checked }));
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async () => {
    // Validate mandatory fields
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all required fields');
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

    // Validate custom required fields
    for (const field of customFields) {
      if (field.is_required && !customFieldData[field.field_name]) {
        alert(`Please fill in ${field.field_label}`);
        return;
      }
    }

    try {
      setSubmitting(true);

      // Step 1: Sign up with role metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'volunteer',
            username: formData.username,
          },
        },
      });

      if (authError) {
        alert(authError.message || 'Signup failed');
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        alert('Signup failed: No user ID returned');
        return;
      }

      // Step 2: Create volunteer profile
      const { data: volunteerId, error: profileError } = await supabase.rpc('create_volunteer_profile', {
        user_id_param: userId,
        username_param: formData.username,
        email_param: formData.email,
      });

      if (profileError) {
        console.error('Error creating volunteer profile:', profileError);
        alert(`Profile creation failed: ${profileError.message}`);
        return;
      }

      // Step 3: Create company association with custom field data via API
      if (selectedCompany && volunteerId) {
        try {
          const response = await fetch('/api/volunteer-company-association', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              volunteer_id: volunteerId,
              company_id: selectedCompany.id,
              custom_field_data: customFieldData,
            })
          });

          if (!response.ok) {
            console.error('Failed to create company association');
          }
        } catch (err) {
          console.error('Error creating company association:', err);
          // Don't fail the whole signup if this fails
        }
      }

      alert('Volunteer registered successfully! Please check your email to verify your account.');
      router.push('/login');

    } catch (err) {
      console.error('Signup error:', err);
      alert('Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCustomField = (field: FormField) => {
    const value = customFieldData[field.field_name] || '';

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type={field.field_type === 'email' ? 'email' : field.field_type === 'number' ? 'number' : 'text'}
              placeholder={field.field_placeholder}
              value={value}
              onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.field_name}
              placeholder={field.field_placeholder}
              value={value}
              onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
              rows={3}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleCustomFieldChange(field.field_name, val)}>
              <SelectTrigger>
                <SelectValue placeholder={field.field_placeholder || `Select ${field.field_label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.select_options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.field_name}
              checked={value === true}
              onCheckedChange={(checked) => handleCustomFieldChange(field.field_name, checked)}
            />
            <Label htmlFor={field.field_name} className="text-sm">
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type="date"
              value={value}
              onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (signingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md shadow-lg text-center p-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-emerald-600">
              Signing you out...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              You were already logged in. We're signing you out so you can create a new volunteer account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stage 1: Company Selection
  if (stage === 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 mr-2"
                onClick={() => router.push('/login')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center">
                <User className="mr-2 h-5 w-5" /> Volunteer Sign Up
              </CardTitle>
            </div>
            <CardDescription>
              Choose the organization you want to volunteer for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingCompanies ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No organizations are currently accepting volunteers.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="company">Select Organization <span className="text-red-500">*</span></Label>
                <Select onValueChange={(companyId) => handleCompanySelect(companyId)}>
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Choose an organization..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          <span>{company.company_name}</span>
                          {company.industry && (
                            <span className="text-xs text-gray-500">({company.industry})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCompany && selectedCompany.signup_description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {selectedCompany.signup_description}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stage 2: Details Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 py-12">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 mr-2"
              onClick={() => setStage('company')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center">
              <User className="mr-2 h-5 w-5" /> Volunteer Sign Up
            </CardTitle>
          </div>
          <CardDescription>
            Step 2 of 2: Complete your profile for {selectedCompany?.company_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mandatory Fields */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Badge variant="secondary">Required Information</Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2 pb-2">
                <Badge variant="secondary">Additional Information</Badge>
              </div>
              {customFields.map(field => renderCustomField(field))}
            </div>
          )}

          {/* Terms */}
          <div className="flex items-center space-x-2 border-t pt-4">
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
              {" "}<span className="text-red-500">*</span>
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
