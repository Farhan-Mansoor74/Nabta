"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import OpportunitiesHeader from '@/components/opportunities/header';
import OpportunitiesList from '@/components/opportunities/list';
import OpportunitiesFilters from '@/components/opportunities/filters';

export default function OpportunitiesPage() {
  // Filter state
  const [distance, setDistance] = useState([25]);
  const [virtualOnly, setVirtualOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="pt-16 min-h-screen">
      <OpportunitiesHeader />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1 hidden xl:block">
            <OpportunitiesFilters
              distance={distance}
              setDistance={setDistance}
              virtualOnly={virtualOnly}
              setVirtualOnly={setVirtualOnly}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
            />
          </div>
          <div className="xl:col-span-3">
            {/* Mobile/Tablet Filters - Only show below xl screens */}
            <div className="xl:hidden mb-6">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                {(selectedCategories.length > 0 || distance[0] !== 25 || virtualOnly || searchInput) && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {[selectedCategories.length, distance[0] !== 25 ? 1 : 0, virtualOnly ? 1 : 0, searchInput ? 1 : 0].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
              
              {showMobileFilters && (
                <div className="mt-4">
                  <OpportunitiesFilters 
                    distance={distance}
                    setDistance={setDistance}
                    virtualOnly={virtualOnly}
                    setVirtualOnly={setVirtualOnly}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                  />
                </div>
              )}
            </div>
            
            <OpportunitiesList
              distance={distance}
              virtualOnly={virtualOnly}
              selectedCategories={selectedCategories}
              searchInput={searchInput}
              showMobileFilters={showMobileFilters}
              setShowMobileFilters={setShowMobileFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}