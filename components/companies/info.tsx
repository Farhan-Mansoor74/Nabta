"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  Target,
  Award,
  BarChart,
  Clock
} from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: "15,000+",
    label: "Active Volunteers",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
  },
  {
    icon: Calendar,
    value: "500+",
    label: "Events Organized",
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
  },
  {
    icon: Target,
    value: "120+",
    label: "Partner Companies",
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
  },
  {
    icon: Clock,
    value: "50,000+",
    label: "Volunteer Hours",
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
  }
];

const features = [
  {
    title: "Comprehensive Impact Tracking",
    description: "Monitor volunteer participation, hours contributed, and environmental impact metrics through our intuitive dashboard.",
    image: "https://images.pexels.com/photos/7376/startup-photos.jpg",
  },
  {
    title: "Employee Engagement Analytics",
    description: "Gain insights into team participation rates, popular causes, and the overall social impact of your corporate volunteering program.",
    image: "https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg",
  }
];

export default function CompanyInfo() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('company-info');
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
      
      if (isVisible) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="company-info" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.label}
                className={cn(
                  "transition-all duration-500 transform",
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                  { "delay-100": index === 1 },
                  { "delay-200": index === 2 },
                  { "delay-300": index === 3 }
                )}
              >
                <CardContent className="p-6 text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4",
                    stat.color
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <div className="space-y-20">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
                index % 2 === 1 && "lg:flex-row-reverse"
              )}
            >
              <div 
                className={cn(
                  "transition-all duration-700 transform",
                  isVisible ? "translate-x-0 opacity-100" : index % 2 === 0 ? "-translate-x-12 opacity-0" : "translate-x-12 opacity-0"
                )}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {feature.title}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  {feature.description}
                </p>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div 
                className={cn(
                  "relative rounded-lg overflow-hidden transition-all duration-700 transform",
                  isVisible ? "translate-x-0 opacity-100" : index % 2 === 0 ? "translate-x-12 opacity-0" : "-translate-x-12 opacity-0"
                )}
              >
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}