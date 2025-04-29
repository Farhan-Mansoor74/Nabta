"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  Check,
  ArrowRight,
  Gem,
  Shield,
  Globe
} from 'lucide-react';

const pricingPlans = [
  {
    name: "Starter",
    description: "Essential features for small businesses starting their volunteering journey",
    price: {
      monthly: "$99",
      yearly: "$79"
    },
    billingPeriod: {
      monthly: "/month",
      yearly: "/month, billed annually"
    },
    features: [
      "Up to 50 volunteer accounts",
      "10 volunteering events/month",
      "Basic analytics dashboard",
      "Email support",
      "Standard reports"
    ],
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    icon: Globe,
    popular: false
  },
  {
    name: "Professional",
    description: "Advanced solutions for growing companies looking to expand their impact",
    price: {
      monthly: "$199",
      yearly: "$159"
    },
    billingPeriod: {
      monthly: "/month",
      yearly: "/month, billed annually"
    },
    features: [
      "Up to 200 volunteer accounts",
      "Unlimited volunteering events",
      "Advanced impact analytics",
      "Priority email support",
      "Custom reports and dashboards",
      "Single sign-on integration",
      "API access"
    ],
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    icon: Shield,
    popular: true
  },
  {
    name: "Enterprise",
    description: "Comprehensive solutions for large organizations with global impact goals",
    price: {
      monthly: "$399",
      yearly: "$319"
    },
    billingPeriod: {
      monthly: "/month",
      yearly: "/month, billed annually"
    },
    features: [
      "Unlimited volunteer accounts",
      "Unlimited volunteering events",
      "Enterprise analytics & reporting",
      "Dedicated account manager",
      "24/7 premium support",
      "Custom integrations",
      "White-labeling options",
      "Advanced security features",
      "Multi-region support"
    ],
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    icon: Gem,
    popular: false
  }
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('pricing-section');
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
    <section id="pricing-section" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that best fits your organization's volunteering needs and impact goals
          </p>
          
          <div className="flex items-center justify-center mt-8">
            <Label htmlFor="billing-toggle" className={cn(
              "text-sm font-medium mr-2",
              !isYearly ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
            )}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-emerald-600"
            />
            <Label htmlFor="billing-toggle" className={cn(
              "text-sm font-medium ml-2",
              isYearly ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
            )}>
              Yearly <Badge className="ml-1 bg-emerald-600 hover:bg-emerald-700">Save 20%</Badge>
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name}
                className={cn(
                  "relative transition-all duration-500 transform border-2",
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
                  { "delay-100": index === 1 },
                  { "delay-200": index === 2 },
                  plan.popular ? "border-emerald-500 dark:border-emerald-500 shadow-lg" : "border-gray-200 dark:border-gray-800"
                )}
              >
                {plan.popular && (
                  <Badge 
                    className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-600"
                  >
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                    plan.color
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {plan.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      {isYearly ? plan.billingPeriod.yearly : plan.billingPeriod.monthly}
                    </span>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <div className="mr-2 mt-0.5">
                          <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={cn(
                      "w-full",
                      plan.popular 
                        ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700" 
                        : "bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-800"
                    )}
                  >
                    Choose {plan.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-20 text-center">
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Need a custom solution? <a href="#contact" className="font-medium text-emerald-600 dark:text-emerald-500 hover:underline">Contact our sales team</a> to design a plan that perfectly meets your organization's unique requirements.
          </p>
        </div>
      </div>
    </section>
  );
}