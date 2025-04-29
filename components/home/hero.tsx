"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 min-h-[90vh] flex items-center overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-200 dark:bg-emerald-900/30 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={cn(
            "transition-all duration-1000 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
              <span className="text-emerald-600 dark:text-emerald-400">Growing</span> a greener future, together
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-lg">
              Connect with local environmental volunteering opportunities and make a meaningful impact on our planet.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/opportunities">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white">
                  Find Opportunities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/for-companies">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/50">
                  For Companies
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center space-x-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                      {i}K+
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Joined by <span className="font-semibold">10,000+</span> volunteers
              </p>
            </div>
          </div>

          <div className={cn(
            "relative rounded-lg overflow-hidden shadow-xl h-[500px] transition-all duration-1000 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 delay-300"
          )}>
            <img 
              src="https://images.pexels.com/photos/6647025/pexels-photo-6647025.jpeg" 
              alt="Volunteers planting trees" 
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex flex-col justify-end p-8">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 mb-2">
                Featured Initiative
              </span>
              <h3 className="text-xl font-semibold text-white mb-1">Urban Reforestation Project</h3>
              <p className="text-gray-200 text-sm mb-3">Join us in planting 5,000 trees across the city</p>
              <div className="flex items-center text-sm text-gray-300">
                <span className="mr-3">350 volunteers</span>
                <span>Starting June 15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}