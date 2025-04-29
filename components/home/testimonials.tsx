"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample testimonials data
const testimonials = [
  {
    id: 1,
    name: "Emma Rodriguez",
    role: "Student Volunteer",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    quote: "Nabta has transformed the way I contribute to my community. The platform makes it so easy to find opportunities that match both my schedule and passion for environmental conservation.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Regular Volunteer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "I've been volunteering for years, but Nabta has connected me with initiatives I never would have discovered otherwise. The impact tracking features help me see how my efforts are making a difference.",
    rating: 5,
  },
  {
    id: 3,
    name: "Sarah Johnson",
    role: "Corporate Volunteer Lead",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    quote: "As a sustainability coordinator for my company, Nabta has been invaluable in organizing group volunteer events. The platform's company dashboard makes it simple to track our collective impact.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Williams",
    role: "Environmental Enthusiast",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    quote: "The rewards system on Nabta gives an extra incentive to participate, but the real reward is seeing the tangible environmental impact our community is making together.",
    rating: 4,
  },
  {
    id: 5,
    name: "Aisha Patel",
    role: "College Student",
    avatar: "https://randomuser.me/api/portraits/women/62.jpg",
    quote: "As a busy student, I appreciate how Nabta helps me find short-term volunteering options that fit between classes. I've earned meaningful experience for my resume while helping the planet.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('testimonials');
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
    <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Voices from Our Community
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Hear from volunteers and organizations who are making a difference through Nabta.
          </p>
        </div>

        <div className={cn(
          "transition-all duration-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full border border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                      <Quote className="h-8 w-8 text-emerald-500/20 dark:text-emerald-400/20 mb-4" />
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                        "{testimonial.quote}"
                      </p>
                      
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-sm">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={cn(
                              "w-5 h-5",
                              i < testimonial.rating 
                                ? "text-yellow-400 dark:text-yellow-300" 
                                : "text-gray-300 dark:text-gray-600"
                            )}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8">
              <CarouselPrevious className="static translate-y-0 mr-2" />
              <CarouselNext className="static translate-y-0 ml-2" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}