"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GripVertical, Type, Mail, Phone, Hash, AlignLeft, CheckSquare, Calendar, ChevronDown } from 'lucide-react';
import { FormFieldDefinition } from './AddFieldDialog';

interface FormFieldCardProps {
  field: FormFieldDefinition;
  onEdit: (field: FormFieldDefinition) => void;
  onDelete: (fieldId: string) => void;
  isDragging?: boolean;
}

const FIELD_ICONS: Record<string, any> = {
  text: Type,
  email: Mail,
  phone: Phone,
  number: Hash,
  textarea: AlignLeft,
  checkbox: CheckSquare,
  date: Calendar,
  select: ChevronDown,
};

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  email: 'Email',
  phone: 'Phone',
  number: 'Number',
  textarea: 'Text Area',
  checkbox: 'Checkbox',
  date: 'Date',
  select: 'Dropdown',
};

export default function FormFieldCard({ field, onEdit, onDelete, isDragging }: FormFieldCardProps) {
  const Icon = FIELD_ICONS[field.field_type] || Type;

  const handleDelete = () => {
    if (field.id) {
      if (confirm(`Are you sure you want to delete the field "${field.field_label}"?`)) {
        onDelete(field.id);
      }
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${isDragging ? 'opacity-50' : ''} ${!field.is_active ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Drag Handle */}
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
              <GripVertical className="h-5 w-5" />
            </div>

            {/* Field Icon & Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{field.field_label}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    Field name: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{field.field_name}</code>
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {FIELD_TYPE_LABELS[field.field_type]}
                </Badge>
                {field.is_required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
                {!field.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(field)}
              className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Additional Info */}
      {(field.field_placeholder || (field.select_options && field.select_options.length > 0)) && (
        <CardContent className="pt-0 pb-4">
          {field.field_placeholder && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-medium">Placeholder:</span> {field.field_placeholder}
            </p>
          )}

          {field.field_type === 'select' && field.select_options && field.select_options.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Options:</p>
              <div className="flex flex-wrap gap-1">
                {field.select_options.map((option, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
