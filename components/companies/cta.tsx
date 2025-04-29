"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Check, Building2, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CompanyCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // In a real application, you would send this to your backend
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950 dark:via-teal-950 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Image Section */}
                <div className="lg:col-span-2 relative min-h-[300px] lg:min-h-full bg-emerald-600 dark:bg-emerald-800 overflow-hidden">
                  <img 
                    src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg" 
                    alt="Company team meeting" 
                    className="object-cover w-full h-full opacity-50 mix-blend-overlay"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-teal-700/90 dark:from-emerald-800/90 dark:to-teal-900/90"></div>
                  <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Join Leading Companies</h3>
                    <p className="text-white/90 mb-6">
                      Partner with us to make a meaningful environmental impact while engaging your employees.
                    </p>
                    <ul className="space-y-4">
                      {[
                        { icon: Building2, text: 'Join 120+ companies making a difference' },
                        { icon: Users, text: '15,000+ engaged employees' },
                        { icon: BarChart3, text: 'Track and showcase your impact' },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <li key={i} className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm md:text-base">{item.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="lg:col-span-3 p-8 md:p-12">
                  <div className="max-w-md">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                      Ready to empower your team?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      Join other forward-thinking companies in making a positive environmental impact while building team engagement and demonstrating corporate responsibility.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <Link href="/signup?type=company">
                        <Button size="lg" className="w-full justify-between bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                          <span>Get Started Now</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                      <Link href="/pricing">
                        <Button size="lg" variant="outline" className="w-full justify-between">
                          <span>View Pricing Plans</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Stay updated with new features and success stories
                      </p>
                      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <Input
                            type="email"
                            placeholder="Work email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full"
                            disabled={submitted}
                            required
                          />
                        </div>
                        <Button 
                          type="submit"
                          disabled={submitted}
                          className={cn(
                            "transition-all",
                            submitted 
                              ? "bg-green-600 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-600" 
                              : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                          )}
                        >
                          {submitted ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Subscribed!
                            </>
                          ) : (
                            "Subscribe"
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}