"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  Heart, 
  Leaf, 
  BarChart3 
} from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: "Boost Employee Engagement",
    description: "Increase team morale and retention through meaningful environmental volunteering opportunities.",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Trophy,
    title: "Enhance Brand Reputation",
    description: "Demonstrate your commitment to sustainability and corporate social responsibility.",
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: TrendingUp,
    title: "Track Impact Metrics",
    description: "Access detailed analytics and reports on your company's environmental contributions.",
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
  {
    icon: Heart,
    title: "Build Community Relations",
    description: "Connect with local communities and create lasting positive impact through environmental initiatives.",
    color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
  {
    icon: Leaf,
    title: "Environmental Leadership",
    description: "Lead by example in environmental stewardship and inspire other organizations to follow.",
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
  {
    icon: BarChart3,
    title: "ESG Performance",
    description: "Improve your Environmental, Social, and Governance metrics through verified impact data.",
    color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  },
];

export default function CompanyBenefits() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('benefits');
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
    <section id="benefits" className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Benefits for Companies
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join hundreds of forward-thinking companies making a difference through environmental volunteering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            
            return (
              <Card 
                key={benefit.title}
                className={cn(
                  "transition-all duration-500 transform",
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                  { "transition-delay-300": index === 1 || index === 4 },
                  { "transition-delay-600": index === 2 || index === 5 }
                )}
              >
                <CardContent className="p-6">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                    benefit.color
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}