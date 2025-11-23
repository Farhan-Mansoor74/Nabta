"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type FormFieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';

export interface FormFieldDefinition {
  id?: string;
  company_id?: string;
  field_name: string;
  field_label: string;
  field_type: FormFieldType;
  field_placeholder?: string;
  is_required: boolean;
  select_options?: string[];
  validation_rules?: Record<string, any>;
  display_order: number;
  is_active: boolean;
}

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (field: FormFieldDefinition) => void;
  editField?: FormFieldDefinition | null;
  existingFieldCount: number;
}

const FIELD_TYPES: { value: FormFieldType; label: string; description: string }[] = [
  { value: 'text', label: 'Text', description: 'Single line text input' },
  { value: 'email', label: 'Email', description: 'Email address with validation' },
  { value: 'phone', label: 'Phone', description: 'Phone number input' },
  { value: 'number', label: 'Number', description: 'Numeric input only' },
  { value: 'textarea', label: 'Text Area', description: 'Multi-line text input' },
  { value: 'select', label: 'Dropdown', description: 'Select from options' },
  { value: 'checkbox', label: 'Checkbox', description: 'Yes/No checkbox' },
  { value: 'date', label: 'Date', description: 'Date picker' },
];

export default function AddFieldDialog({ open, onOpenChange, onSave, editField, existingFieldCount }: AddFieldDialogProps) {
  const [formData, setFormData] = useState<FormFieldDefinition>({
    field_name: '',
    field_label: '',
    field_type: 'text',
    field_placeholder: '',
    is_required: false,
    select_options: [],
    display_order: existingFieldCount,
    is_active: true,
  });

  const [newOption, setNewOption] = useState('');

  // Initialize form when dialog opens or editField changes
  useState(() => {
    if (editField) {
      setFormData(editField);
    } else {
      setFormData({
        field_name: '',
        field_label: '',
        field_type: 'text',
        field_placeholder: '',
        is_required: false,
        select_options: [],
        display_order: existingFieldCount,
        is_active: true,
      });
    }
  });

  const handleChange = (field: keyof FormFieldDefinition, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate field_name from field_label if not editing
    if (field === 'field_label' && !editField) {
      const fieldName = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      setFormData(prev => ({ ...prev, field_name: fieldName }));
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        select_options: [...(prev.select_options || []), newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      select_options: prev.select_options?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    // Validation
    if (!formData.field_label.trim()) {
      alert('Please enter a field label');
      return;
    }

    if (!formData.field_name.trim()) {
      alert('Please enter a field name');
      return;
    }

    if (formData.field_type === 'select' && (!formData.select_options || formData.select_options.length === 0)) {
      alert('Please add at least one option for dropdown fields');
      return;
    }

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      field_name: '',
      field_label: '',
      field_type: 'text',
      field_placeholder: '',
      is_required: false,
      select_options: [],
      display_order: existingFieldCount,
      is_active: true,
    });
    setNewOption('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-emerald-600">
            {editField ? 'Edit Field' : 'Add Custom Field'}
          </DialogTitle>
          <DialogDescription>
            Create custom fields for your volunteer signup form. These fields will be shown to volunteers when they sign up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Field Type */}
          <div className="space-y-2">
            <Label htmlFor="field_type">Field Type *</Label>
            <Select
              value={formData.field_type}
              onValueChange={(value) => handleChange('field_type', value as FormFieldType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-gray-500">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field Label */}
          <div className="space-y-2">
            <Label htmlFor="field_label">Field Label *</Label>
            <Input
              id="field_label"
              placeholder="e.g., Student ID, Department, Phone Number"
              value={formData.field_label}
              onChange={(e) => handleChange('field_label', e.target.value)}
            />
            <p className="text-xs text-gray-500">This is what volunteers will see</p>
          </div>

          {/* Field Name (Internal) */}
          <div className="space-y-2">
            <Label htmlFor="field_name">Field Name (Internal) *</Label>
            <Input
              id="field_name"
              placeholder="e.g., student_id, department, phone_number"
              value={formData.field_name}
              onChange={(e) => handleChange('field_name', e.target.value)}
            />
            <p className="text-xs text-gray-500">Used internally to store data (lowercase, underscores only)</p>
          </div>

          {/* Placeholder */}
          {formData.field_type !== 'checkbox' && formData.field_type !== 'select' && (
            <div className="space-y-2">
              <Label htmlFor="field_placeholder">Placeholder Text</Label>
              <Input
                id="field_placeholder"
                placeholder="e.g., Enter your student ID"
                value={formData.field_placeholder}
                onChange={(e) => handleChange('field_placeholder', e.target.value)}
              />
              <p className="text-xs text-gray-500">Optional hint text shown in the field</p>
            </div>
          )}

          {/* Dropdown Options */}
          {formData.field_type === 'select' && (
            <div className="space-y-2">
              <Label>Dropdown Options *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter option and press Add"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddOption} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {formData.select_options && formData.select_options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.select_options.map((option, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {option}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveOption(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Required Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_required">Required Field</Label>
              <p className="text-sm text-gray-500">Volunteers must fill this field to complete signup</p>
            </div>
            <Switch
              id="is_required"
              checked={formData.is_required}
              onCheckedChange={(checked) => handleChange('is_required', checked)}
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-gray-500">Show this field on the signup form</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
            {editField ? 'Update Field' : 'Add Field'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
