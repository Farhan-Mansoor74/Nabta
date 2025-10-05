"use client";
import { useState } from 'react';
import CompanyDashboardHeader from '@/components/company-dashboard/header';
import CompanyStats from '@/components/company-dashboard/stats';
import CompanyOpportunities from '@/components/company-dashboard/opportunities';
import CompanyTeam from '@/components/company-dashboard/team';
import CompanyImpact from '@/components/company-dashboard/impact';
import EventEditorDialog, { Opportunity } from '@/components/company-dashboard/EventEditorDialog';

export default function CompanyDashboardPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<Opportunity | null>({
    id: 0,
    title: '',
    category: '',
    date: '',
    location: '',
    participants: 0,
    capacity: 0,
    status: 'draft',
    views: 0,
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    image_url: '',
    max_participants: 0,
    current_participants: 0,
    points: 0,
    featured: false,
    icon_name: '',
    latitude: '',
    longitude: ''
  });

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleSaveDraft = (updated: Opportunity) => {
    setDraft(updated);
    setCreateOpen(false);
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <CompanyDashboardHeader onCreate={handleOpenCreate} />
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          <CompanyStats />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CompanyOpportunities />
            </div>
            <div>
              <CompanyTeam />
            </div>
          </div>
          <CompanyImpact />
        </div>
      </div>

      <EventEditorDialog open={createOpen} onOpenChange={setCreateOpen} opportunity={draft} onSave={handleSaveDraft} />
    </div>
  );
}