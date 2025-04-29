import { Card, CardContent } from '@/components/ui/card';
import { Building, Leaf, School, Landmark, Heart } from 'lucide-react';

// Sample partner logos
const partners = [
  { name: "EcoTech Solutions", icon: Building, type: "Corporate" },
  { name: "Green Earth Foundation", icon: Leaf, type: "Non-Profit" },
  { name: "State University", icon: School, type: "Educational" },
  { name: "City Council", icon: Landmark, type: "Government" },
  { name: "Community Heroes", icon: Heart, type: "Community" },
];

export default function Partners() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Our Partners
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We collaborate with organizations committed to environmental sustainability and social responsibility.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            
            return (
              <Card 
                key={partner.name} 
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 h-40">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-4 shadow-sm group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                    <Icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="font-medium text-center text-gray-900 dark:text-white">{partner.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{partner.type}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Interested in partnering with us? <a href="/contact" className="text-emerald-600 dark:text-emerald-400 hover:underline">Get in touch</a>.
          </p>
        </div>
      </div>
    </section>
  );
}