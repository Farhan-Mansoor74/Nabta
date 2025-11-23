"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormFieldDefinition } from './AddFieldDialog';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface FormPreviewProps {
  fields: FormFieldDefinition[];
  companyName?: string;
}

export default function FormPreview({ fields, companyName = 'Your Company' }: FormPreviewProps) {
  const activeFields = fields.filter(f => f.is_active).sort((a, b) => a.display_order - b.display_order);

  const renderField = (field: FormFieldDefinition) => {
    const labelContent = (
      <Label htmlFor={field.field_name}>
        {field.field_label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>
    );

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div key={field.field_name} className="space-y-2">
            {labelContent}
            <Input
              id={field.field_name}
              type={field.field_type === 'email' ? 'email' : field.field_type === 'number' ? 'number' : 'text'}
              placeholder={field.field_placeholder || `Enter ${field.field_label.toLowerCase()}`}
              disabled
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.field_name} className="space-y-2">
            {labelContent}
            <Textarea
              id={field.field_name}
              placeholder={field.field_placeholder || `Enter ${field.field_label.toLowerCase()}`}
              disabled
              rows={3}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.field_name} className="space-y-2">
            {labelContent}
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder={field.field_placeholder || `Select ${field.field_label.toLowerCase()}`} />
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
          <div key={field.field_name} className="flex items-center space-x-2">
            <Checkbox id={field.field_name} disabled />
            <Label htmlFor={field.field_name} className="text-sm">
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'date':
        return (
          <div key={field.field_name} className="space-y-2">
            {labelContent}
            <Input
              id={field.field_name}
              type="date"
              placeholder={field.field_placeholder}
              disabled
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-lg">Form Preview</CardTitle>
        </div>
        <CardDescription>
          This is how volunteers will see your signup form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-sm space-y-6">
            {/* Mock Header */}
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold text-emerald-600 mb-1">Volunteer Sign Up</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Join {companyName} as a volunteer
              </p>
            </div>

            {/* Mandatory Fields (Mock) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">Mandatory Fields</Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview_username">Username <span className="text-red-500">*</span></Label>
                <Input id="preview_username" placeholder="johndoe" disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview_email">Email <span className="text-red-500">*</span></Label>
                <Input id="preview_email" type="email" placeholder="you@example.com" disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview_password">Password <span className="text-red-500">*</span></Label>
                <Input id="preview_password" type="password" disabled />
              </div>
            </div>

            {/* Custom Fields */}
            {activeFields.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">Additional Information</Badge>
                </div>
                {activeFields.map(field => renderField(field))}
              </div>
            )}

            {activeFields.length === 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600 border-t">
                <p className="text-sm">No custom fields added yet</p>
                <p className="text-xs mt-1">Add fields to see them in the preview</p>
              </div>
            )}

            {/* Mock Terms Checkbox */}
            <div className="flex items-center space-x-2 border-t pt-4">
              <Checkbox id="preview_terms" disabled />
              <Label htmlFor="preview_terms" className="text-sm">
                I agree to the Terms and Conditions <span className="text-red-500">*</span>
              </Label>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Email verification and password requirements are automatically handled by the system.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
