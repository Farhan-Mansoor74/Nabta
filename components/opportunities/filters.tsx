"use client";

import { useState } from 'react';
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

const timeCommitments = [
  "One-time event",
  "Weekly",
  "Monthly",
  "Ongoing",
  "Flexible",
];

const suitableFor = [
  "Individuals",
  "Groups",
  "Families",
  "Students",
  "Corporate teams",
  "Remote volunteers",
];

export default function OpportunitiesFilters() {
  const [distance, setDistance] = useState([25]);
  const [virtualOnly, setVirtualOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  
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
    <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        {(selectedCategories.length > 0 || distance[0] !== 25 || virtualOnly) && (
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
            <span className="text-sm text-gray-600 dark:text-gray-400">Within {distance[0]} miles</span>
          </div>
          <Slider
            value={distance}
            onValueChange={setDistance}
            max={100}
            step={5}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-2">
            <span>5 miles</span>
            <span>50 miles</span>
            <span>100 miles</span>
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
      
      {/* Time commitment filter */}
      <Accordion type="single" collapsible className="border-t border-gray-200 dark:border-gray-800">
        <AccordionItem value="time" className="border-b-0">
          <AccordionTrigger className="py-4 text-sm font-medium text-gray-900 dark:text-white">
            Time Commitment
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {timeCommitments.map(time => (
                <div key={time} className="flex items-center space-x-2">
                  <Checkbox id={`time-${time}`} />
                  <Label 
                    htmlFor={`time-${time}`}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {time}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Suitable for filter */}
      <Accordion type="single" collapsible className="border-t border-gray-200 dark:border-gray-800">
        <AccordionItem value="suitable" className="border-b-0">
          <AccordionTrigger className="py-4 text-sm font-medium text-gray-900 dark:text-white">
            Suitable For
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {suitableFor.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox id={`suitable-${option}`} />
                  <Label 
                    htmlFor={`suitable-${option}`}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}