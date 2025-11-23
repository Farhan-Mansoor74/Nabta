"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, Info } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import AddFieldDialog, { FormFieldDefinition } from '@/components/company-dashboard/AddFieldDialog';
import FormFieldCard from '@/components/company-dashboard/FormFieldCard';
import FormPreview from '@/components/company-dashboard/FormPreview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function VolunteerFormPage() {
  const [fields, setFields] = useState<FormFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editField, setEditField] = useState<FormFieldDefinition | null>(null);
  const [companyName, setCompanyName] = useState('Your Company');
  const [hasChanges, setHasChanges] = useState(false);

  // TODO: Fetch fields from API when backend is ready
  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/companies/form-fields');
      if (!response.ok) {
        throw new Error('Failed to fetch form fields');
      }

      const data = await response.json();
      setFields(data.fields || []);
      setCompanyName(data.companyName || 'Your Company');
      setHasChanges(false);

    } catch (error) {
      console.error('Error loading form fields:', error);
      alert('Failed to load form fields');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (newField: FormFieldDefinition) => {
    try {
      if (editField) {
        // Update existing field via API
        const response = await fetch(`/api/companies/form-fields/${editField.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newField)
        });

        if (!response.ok) {
          throw new Error('Failed to update field');
        }

        const updatedField = await response.json();
        setFields(prev => prev.map(f => f.id === editField.id ? updatedField : f));
        setEditField(null);
        alert('Field updated successfully!');
      } else {
        // Create new field via API
        const response = await fetch('/api/companies/form-fields', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newField)
        });

        if (!response.ok) {
          throw new Error('Failed to create field');
        }

        const createdField = await response.json();
        setFields(prev => [...prev, createdField]);
        alert('Field added successfully!');
      }

      setAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Failed to save field');
    }
  };

  const handleEditField = (field: FormFieldDefinition) => {
    setEditField(field);
    setAddDialogOpen(true);
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      const response = await fetch(`/api/companies/form-fields/${fieldId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete field');
      }

      setFields(prev => prev.filter(f => f.id !== fieldId));
      alert('Field deleted successfully!');
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Failed to delete field');
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/companies/form-fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        throw new Error('Failed to save fields');
      }

      setHasChanges(false);
      alert('Form fields saved successfully!');

    } catch (error) {
      console.error('Error saving form fields:', error);
      alert('Failed to save form fields');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setAddDialogOpen(false);
    setEditField(null);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-16">
        {/* Header */}
        <div className="border-b bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Volunteer Signup Form Builder
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  Customize the information you collect from volunteers during signup
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="whitespace-nowrap"
                >
                  Back to Dashboard
                </Button>
                {hasChanges && (
                  <Button
                    onClick={handleSaveAll}
                    disabled={saving}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              <strong>How it works:</strong> Add custom fields to collect additional information from volunteers.
              The basic fields (username, email, password) are always included automatically.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Field Button */}
              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                  <CardDescription>
                    Create and manage additional fields for your volunteer signup form
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setAddDialogOpen(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Field
                  </Button>
                </CardContent>
              </Card>

              {/* Fields List */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : fields.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 dark:text-gray-600">
                      <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No custom fields yet</h3>
                      <p className="text-sm mb-4">
                        Get started by adding your first custom field
                      </p>
                      <Button
                        onClick={() => setAddDialogOpen(true)}
                        variant="outline"
                        className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {fields
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((field) => (
                      <FormFieldCard
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                      />
                    ))}
                </div>
              )}

              {/* Info Card */}
              {fields.length > 0 && (
                <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      <strong>Tip:</strong> You can drag and drop fields to reorder them.
                      Required fields will be enforced during volunteer signup.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-1">
              <FormPreview fields={fields} companyName={companyName} />
            </div>
          </div>
        </div>

        {/* Add/Edit Field Dialog */}
        <AddFieldDialog
          open={addDialogOpen}
          onOpenChange={handleCloseDialog}
          onSave={handleAddField}
          editField={editField}
          existingFieldCount={fields.length}
        />
      </div>
    </AuthGuard>
  );
}
