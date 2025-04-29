"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Search, Calendar, UserCheck, Award } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: "Find Opportunities",
    description: "Browse through our curated list of local environmental volunteering opportunities that match your interests and availability.",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Calendar,
    title: "Sign Up & Attend",
    description: "Register for events that interest you and commit to making a difference. Show up and contribute your time and skills.",
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: UserCheck,
    title: "Track Your Impact",
    description: "See the tangible results of your volunteering efforts and understand how you're contributing to environmental goals.",
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
  {
    icon: Award,
    title: "Earn & Redeem Points",
    description: "Accumulate points for your participation that can be redeemed for eco-friendly products, discounts, and special experiences.",
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
];

export default function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('how-it-works');
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
      
      if (isVisible && !isInView) {
        setIsInView(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How Nabta Works</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Making a positive environmental impact has never been easier. Our platform connects you with meaningful opportunities in just a few simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <Card 
                key={step.title}
                className={cn(
                  "border-2 transition-all duration-300 transform",
                  activeIndex === index ? "border-emerald-500 dark:border-emerald-400 scale-105" : "border-transparent",
                  isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                  { "transition-delay-300": index === 1 },
                  { "transition-delay-600": index === 2 },
                  { "transition-delay-900": index === 3 },
                )}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <CardContent className="p-6 text-center">
                  <div className={cn(
                    "mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-6",
                    step.color
                  )}>
                    <Icon className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                  
                  <div className="flex items-center justify-center mt-6">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {index + 1}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="relative mt-16 pt-16">
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>
          
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Ready to make a difference?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of volunteers who are already creating a positive environmental impact in their communities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}