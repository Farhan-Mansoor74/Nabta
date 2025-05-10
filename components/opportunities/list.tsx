"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Filter, MapPin, Users, Leaf, BookOpen, Recycle, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Expanded sample data for opportunities
const opportunities = [
  {
    id: 1,
    title: "Beach Cleanup Initiative",
    organization: "Ocean Guardians",
    location: "Pacific Beach",
    date: "May 28, 2025",
    time: "9:00 AM - 1:00 PM",
    category: "Ocean Conservation",
    image: "https://images.pexels.com/photos/5745025/pexels-photo-5745025.jpeg",
    participants: 42,
    spots: 75,
    distance: "5.2 miles away",
    points: 250,
    featured: true,
    description: "Join us for a community beach cleanup to remove trash and plastic pollution from our beautiful coastline. All equipment provided.",
    icon: Recycle,
  },
  {
    id: 2,
    title: "Urban Garden Development",
    organization: "Green City Initiative",
    location: "Community Center",
    date: "June 5, 2025",
    time: "10:00 AM - 3:00 PM",
    category: "Urban Greening",
    image: "https://images.pexels.com/photos/8036972/pexels-photo-8036972.jpeg",
    participants: 28,
    spots: 40,
    distance: "3.1 miles away",
    points: 350,
    featured: true,
    description: "Help us transform an unused urban lot into a thriving community garden. Tasks include planting, building raised beds, and installing irrigation.",
    icon: Leaf,
  },
  {
    id: 3,
    title: "Wildlife Habitat Restoration",
    organization: "Wildlife Conservation Society",
    location: "Redwood Nature Reserve",
    date: "June 12, 2025",
    time: "8:00 AM - 2:00 PM",
    category: "Wildlife",
    image: "https://images.pexels.com/photos/31939149/pexels-photo-31939149/free-photo-of-trio-of-antelopes-resting-in-natural-habitat.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    participants: 35,
    spots: 50,
    distance: "12.4 miles away",
    points: 400,
    featured: false,
    description: "Participate in restoring natural habitats for local wildlife. Activities include removing invasive species, planting native vegetation, and building wildlife shelters.",
    icon: Eye,
  },
  {
    id: 4,
    title: "Recycling Education Workshop",
    organization: "Sustainable Living Alliance",
    location: "Downtown Library",
    date: "June 18, 2025",
    time: "4:00 PM - 6:00 PM",
    category: "Education",
    image: "https://images.pexels.com/photos/6964338/pexels-photo-6964338.jpeg",
    participants: 15,
    spots: 30,
    distance: "1.8 miles away",
    points: 200,
    featured: false,
    description: "Volunteers needed to help run recycling education workshops for local schools and community groups. Training provided.",
    icon: BookOpen,
  },
  {
    id: 5,
    title: "Tree Planting Day",
    organization: "Urban Forestry Project",
    location: "Riverside Park",
    date: "June 24, 2025",
    time: "9:00 AM - 12:00 PM",
    category: "Urban Greening",
    image: "https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg",
    participants: 56,
    spots: 100,
    distance: "4.5 miles away",
    points: 300,
    featured: true,
    description: "Join our city-wide initiative to increase urban tree cover. We'll be planting native trees throughout the park. Tools and guidance provided.",
    icon: Leaf,
  },
  {
    id: 6,
    title: "Water Quality Monitoring",
    organization: "River Keepers Alliance",
    location: "Multiple Locations",
    date: "Ongoing",
    time: "Flexible Hours",
    category: "Water Conservation",
    image: "https://images.pexels.com/photos/3571576/pexels-photo-3571576.jpeg",
    participants: 22,
    spots: 40,
    distance: "Various",
    points: 275,
    featured: false,
    description: "Help monitor local water quality by collecting samples and conducting basic tests. Training and equipment provided. Flexible scheduling available.",
    icon: Recycle,
  },
];

export default function OpportunitiesList() {
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('distance');

  // Sort opportunities based on selected option
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    if (sortBy === 'distance') {
      return parseFloat(a.distance) - parseFloat(b.distance);
    } else if (sortBy === 'date') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'points') {
      return b.points - a.points;
    }
    return 0;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing <strong>{opportunities.length}</strong> opportunities
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <Tabs defaultValue="grid" value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex-1 md:w-40">
            <Select defaultValue="distance" value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="points">Points</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedOpportunities.map((opportunity) => {
            const Icon = opportunity.icon;
            
            return (
              <Card key={opportunity.id} className="overflow-hidden transition-all hover:shadow-lg">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={opportunity.image} 
                    alt={opportunity.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <Badge className="absolute top-3 right-3 bg-emerald-600 dark:bg-emerald-600">
                    {opportunity.category}
                  </Badge>
                  {opportunity.featured && (
                    <Badge className="absolute top-3 left-3 bg-amber-500 dark:bg-amber-500">
                      Featured
                    </Badge>
                  )}
                </div>
                
                <CardContent className="pt-6">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-2">
                      <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {opportunity.points} points
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {opportunity.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    By {opportunity.organization}
                  </p>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                    {opportunity.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      {opportunity.location} ({opportunity.distance})
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      {opportunity.date}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      {opportunity.time}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col items-start pt-0">
                  <div className="w-full flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-400" />
                      <span>{opportunity.participants}/{opportunity.spots} joined</span>
                    </div>
                    <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                        style={{ width: `${(opportunity.participants / opportunity.spots) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Link href={`/opportunities/${opportunity.id}`} className="w-full">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                      Learn More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOpportunities.map((opportunity) => {
            const Icon = opportunity.icon;
            
            return (
              <Card key={opportunity.id} className="overflow-hidden transition-all hover:shadow-lg">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 relative">
                    <img 
                      src={opportunity.image} 
                      alt={opportunity.title} 
                      className="w-full h-48 md:h-full object-cover"
                    />
                    {opportunity.featured && (
                      <Badge className="absolute top-3 left-3 bg-amber-500 dark:bg-amber-500">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-emerald-600 dark:bg-emerald-600">
                        {opportunity.category}
                      </Badge>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-1">
                          <Icon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {opportunity.points} points
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {opportunity.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      By {opportunity.organization}
                    </p>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {opportunity.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                        {opportunity.location}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                        {opportunity.date}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                        {opportunity.time}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-400" />
                          <span>{opportunity.participants}/{opportunity.spots}</span>
                        </div>
                        <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                            style={{ width: `${(opportunity.participants / opportunity.spots) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <Link href={`/opportunities/${opportunity.id}`}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      <div className="mt-8 flex justify-center">
        <Button variant="outline" className="mx-auto">
          Load More Opportunities
        </Button>
      </div>
    </div>
  );
}