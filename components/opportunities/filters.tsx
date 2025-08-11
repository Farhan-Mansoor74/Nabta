"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const categories = [
  "Ocean Conservation",
  "Urban Greening",
  "Wildlife",
  "Education",
  "Waste Management",
  "Climate Action",
  "Renewable Energy",
  "Water Conservation",
];

interface OpportunitiesFiltersProps {
  distance: number[];
  setDistance: (d: number[]) => void;
  virtualOnly: boolean;
  setVirtualOnly: (v: boolean) => void;
  selectedCategories: string[];
  setSelectedCategories: (c: string[]) => void;
  searchInput: string;
  setSearchInput: (s: string) => void;
}

export default function OpportunitiesFilters({
  distance = [25],
  setDistance,
  virtualOnly = false,
  setVirtualOnly,
  selectedCategories = [],
  setSelectedCategories,
  searchInput = '',
  setSearchInput,
}: OpportunitiesFiltersProps) {
  
  const addCategory = (category: string) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  const removeCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter(c => c !== category));
  };
  
  const clearAllFilters = () => {
    setDistance([25]);
    setVirtualOnly(false);
    setSelectedCategories([]);
    setSearchInput("");
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 lg:sticky lg:top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        {(selectedCategories.length > 0 || distance[0] !== 25 || virtualOnly || searchInput) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="h-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Clear all
          </Button>
        )}
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search opportunities" 
            className="pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button 
              className="absolute right-3 top-3"
              onClick={() => setSearchInput("")}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      
      {/* Selected filters */}
      {selectedCategories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <Badge 
              key={category} 
              variant="secondary"
              className="pl-2 pr-1 py-1 flex items-center dark:bg-gray-800"
            >
              {category}
              <button 
                className="ml-1 rounded-full"
                onClick={() => removeCategory(category)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Virtual switch */}
      <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-900 dark:text-white">Virtual opportunities only</span>
        <Switch
          checked={virtualOnly}
          onCheckedChange={setVirtualOnly}
        />
      </div>
      
      {/* Distance slider */}
      {!virtualOnly && (
        <div className="py-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Distance</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Within {distance[0]} km</span>
          </div>
          <Slider
            value={distance}
            onValueChange={setDistance}
            max={100}
            step={5}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-2">
            <span>5 km</span>
            <span>50 km</span>
            <span>100 km</span>
          </div>
        </div>
      )}
      
      {/* Category filter */}
      <Accordion type="single" collapsible defaultValue="categories" className="border-t border-gray-200 dark:border-gray-800">
        <AccordionItem value="categories" className="border-b-0">
          <AccordionTrigger className="py-4 text-sm font-medium text-gray-900 dark:text-white">
            Categories
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`} 
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        addCategory(category);
                      } else {
                        removeCategory(category);
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`category-${category}`}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}