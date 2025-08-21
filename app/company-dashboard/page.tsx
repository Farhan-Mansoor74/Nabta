import CompanyDashboardHeader from '@/components/company-dashboard/header';
import CompanyStats from '@/components/company-dashboard/stats';
import CompanyOpportunities from '@/components/company-dashboard/opportunities';
import CompanyTeam from '@/components/company-dashboard/team';
import CompanyImpact from '@/components/company-dashboard/impact';

export default function CompanyDashboardPage() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <CompanyDashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
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
    </div>
  );
}