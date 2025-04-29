"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react';

// Sample data for opportunities
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
  },
  {
    id: 3,
    title: "Wildlife Habitat Restoration",
    organization: "Wildlife Conservation Society",
    location: "Redwood Nature Reserve",
    date: "June 12, 2025",
    time: "8:00 AM - 2:00 PM",
    category: "Wildlife",
    image: "https://images.pexels.com/photos/14864523/pexels-photo-14864523.jpeg",
    participants: 35,
    spots: 50,
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
  }
];

// Category filters
const categories = [
  "All",
  "Ocean Conservation",
  "Urban Greening",
  "Wildlife",
  "Education",
  "Waste Management",
];

export default function FeaturedOpportunities() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredOpportunities = activeCategory === "All" 
    ? opportunities 
    : opportunities.filter(opp => opp.category === activeCategory);

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Opportunities
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Discover meaningful volunteering opportunities that match your interests and help build a more sustainable future.
            </p>
          </div>
          <Link href="/opportunities" className="mt-4 md:mt-0">
            <Button variant="link" className="text-emerald-600 dark:text-emerald-400 p-0 h-auto font-medium">
              View all opportunities
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={
                activeCategory === category 
                  ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700" 
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Opportunities grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={opportunity.image} 
                  alt={opportunity.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
                <Badge className="absolute top-3 right-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                  {opportunity.category}
                </Badge>
              </div>
              
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {opportunity.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  By {opportunity.organization}
                </p>
                
                <div className="space-y-2 text-sm">
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
          ))}
        </div>
      </div>
    </section>
  );
}