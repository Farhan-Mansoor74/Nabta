"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, Users, LineChart, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CompanyHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-emerald-200 dark:bg-emerald-900/30 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={cn(
            "max-w-xl transition-all duration-1000 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 mb-4">
              <span className="font-medium">For Companies</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Empower Your Team, <span className="text-emerald-600 dark:text-emerald-400">Impact</span> Your Community
            </h1>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              Connect your company with meaningful environmental volunteering opportunities that engage employees and demonstrate your commitment to sustainability.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Link href="/signup?type=company">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                  Join as a Company
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="flex -space-x-2 mr-3">
                {['https://randomuser.me/api/portraits/women/12.jpg', 'https://randomuser.me/api/portraits/men/32.jpg', 'https://randomuser.me/api/portraits/women/28.jpg'].map((avatar, i) => (
                  <img 
                    key={i} 
                    src={avatar} 
                    alt="Company logo" 
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                  />
                ))}
              </div>
              <p>
                Trusted by <span className="font-semibold text-gray-900 dark:text-white">120+</span> companies
              </p>
            </div>
          </div>
          
          <div className={cn(
            "transition-all duration-1000 transform",
            isVisible ? "translate-y-0 opacity-100 delay-300" : "translate-y-8 opacity-0"
          )}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Company Dashboard Preview</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: Calendar, label: "Events Organized", value: "24" },
                    { icon: Users, label: "Team Participation", value: "87%" },
                    { icon: LineChart, label: "Impact Score", value: "94/100" },
                    { icon: Award, label: "Sustainability Rank", value: "Top 5%" },
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mr-3">
                            <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="relative mb-6">
                  <img 
                    src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg" 
                    alt="Company team volunteering" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <p className="text-white font-medium">Recent Team Activity</p>
                    <p className="text-white/80 text-sm">Urban Garden Planting Day</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Upcoming Events</span>
                  <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400">
                    View All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}