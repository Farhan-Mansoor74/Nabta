import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export default function OpportunitiesHeader() {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900 text-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Browse Volunteering Opportunities
          </h1>
          <p className="text-white/90 text-lg mb-6">
            Discover meaningful ways to contribute to environmental
            sustainability in your community.
          </p>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
            <Button className="bg-white text-emerald-700 hover:bg-gray-100">
              <MapPin className="mr-2 h-4 w-4" />
              Near Me
            </Button>
            <Button
              variant="outline"
              className="border-white text-emerald-700 hover:bg-white/10"
            >
              Virtual Opportunities
            </Button>
          </div>

          <div className="text-white/80 text-sm">
            <p>275 opportunities available • Updated hourly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
