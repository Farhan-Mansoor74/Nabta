"use client";

import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';

interface Props {
	onCreate?: () => void;
}

export default function CompanyDashboardHeader({ onCreate }: Props) {
  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Company Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage your volunteering opportunities and track team engagement
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300" 
              onClick={onCreate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Opportunity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}