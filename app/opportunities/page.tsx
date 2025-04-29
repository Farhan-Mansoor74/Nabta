import OpportunitiesHeader from '@/components/opportunities/header';
import OpportunitiesList from '@/components/opportunities/list';
import OpportunitiesFilters from '@/components/opportunities/filters';

export default function OpportunitiesPage() {
  return (
    <div className="pt-16 min-h-screen">
      <OpportunitiesHeader />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <OpportunitiesFilters />
          </div>
          <div className="lg:col-span-3">
            <OpportunitiesList />
          </div>
        </div>
      </div>
    </div>
  );
}