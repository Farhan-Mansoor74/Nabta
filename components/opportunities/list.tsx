"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Filter, MapPin, Users, Leaf, BookOpen, Recycle, Eye, Heart, Star, TreePine, Droplets, Sun, Wind, Shield, Zap, Gift, Award, Target, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/lib/supabaseClient';

// Enhanced icon mapping with more common icon names
const iconMap: Record<string, any> = {
  // Environmental icons
  'Recycle': Recycle,
  'Leaf': Leaf,
  'TreePine': TreePine,
  'Tree': TreePine,
  'Droplets': Droplets,
  'Water': Droplets,
  'Sun': Sun,
  'Solar': Sun,
  'Wind': Wind,
  'Renewable': Wind,
  
  // General icons
  'BookOpen': BookOpen,
  'Book': BookOpen,
  'Education': BookOpen,
  'Eye': Eye,
  'Vision': Eye,
  'Heart': Heart,
  'Community': Heart,
  'Star': Star,
  'Featured': Star,
  'Shield': Shield,
  'Protection': Shield,
  'Zap': Zap,
  'Energy': Zap,
  'Gift': Gift,
  'Volunteer': Gift,
  'Award': Award,
  'Achievement': Award,
  'Target': Target,
  'Goal': Target,
  'Globe': Globe,
  'Global': Globe,
  'World': Globe,
  
  // Add more mappings as needed
};

// Function to get icon component dynamically
function getIconComponent(iconName: string) {
  if (!iconName) return Recycle; // Default fallback
  
  // Try exact match first
  if (iconMap[iconName]) {
    return iconMap[iconName];
  }
  
  // Try case-insensitive match
  const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).toLowerCase();
  if (iconMap[normalizedIconName]) {
    return iconMap[normalizedIconName];
  }
  
  // Try searching for partial matches
  const partialMatch = Object.keys(iconMap).find(key => 
    key.toLowerCase().includes(iconName.toLowerCase()) ||
    iconName.toLowerCase().includes(key.toLowerCase())
  );
  
  if (partialMatch) {
    return iconMap[partialMatch];
  }
  
  // Return default if no match found
  return Recycle;
}

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

// Function to format distance for display
function formatDistance(userLocation: {lat: number, lng: number} | null, lat: string | number | null, lng: string | number | null): {display: string, value: number} {
  // Check if we have all required data
  if (!userLocation || !lat || !lng) {
    return {
      display: 'Location unavailable',
      value: Number.MAX_VALUE
    };
  }
  
  // Parse coordinates
  const eventLat = typeof lat === 'string' ? parseFloat(lat) : lat;
  const eventLng = typeof lng === 'string' ? parseFloat(lng) : lng;
  
  // Validate coordinates
  if (isNaN(eventLat) || isNaN(eventLng) || 
      eventLat < -90 || eventLat > 90 || 
      eventLng < -180 || eventLng > 180) {
    return {
      display: 'Invalid location',
      value: Number.MAX_VALUE
    };
  }
  
  try {
    const distance = calculateDistance(userLocation.lat, userLocation.lng, eventLat, eventLng);
    
    // Format distance based on value
    if (distance < 1) {
      return {
        display: `${Math.round(distance * 1000)}m`,
        value: distance
      };
    } else if (distance < 10) {
      return {
        display: `${distance}km`,
        value: distance
      };
    } else {
      return {
        display: `${Math.round(distance)}km`,
        value: distance
      };
    }
  } catch (error) {
    console.error('Error calculating distance:', error);
    return {
      display: 'Distance error',
      value: Number.MAX_VALUE
    };
  }
}

interface OpportunitiesListProps {
  searchInput: string;
  distance: number[];
  virtualOnly: boolean;
  selectedCategories: string[];
  showMobileFilters: boolean;
  setShowMobileFilters: (show: boolean) => void;
  onLearnMore?: (eventId: number | string) => void;
}

export default function OpportunitiesList({
  searchInput,
  distance,
  virtualOnly,
  selectedCategories,
  showMobileFilters,
  setShowMobileFilters,
  onLearnMore
}: OpportunitiesListProps) {
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('distance');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied' | 'unavailable'>('loading');
  
  // Enhanced geolocation with better error handling
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setLocationStatus('granted');
        console.log('User location obtained:', location);
      },
      (error) => {
        console.error('Error getting user location:', error);
        setLocationStatus('denied');
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            console.log('User denied the request for Geolocation.');
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            console.log('The request to get user location timed out.');
            break;
          default:
            console.log('An unknown error occurred.');
            break;
        }
      },
      options
    );
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    if (opportunities.length === 0) return;

    let filtered = [...opportunities];

    // Search filter
    if (searchInput.trim()) {
      const searchLower = searchInput.toLowerCase();
      filtered = filtered.filter(opportunity => 
        opportunity.title.toLowerCase().includes(searchLower) ||
        opportunity.organization.toLowerCase().includes(searchLower) ||
        opportunity.description.toLowerCase().includes(searchLower) ||
        opportunity.location.toLowerCase().includes(searchLower) ||
        opportunity.category.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(opportunity => 
        selectedCategories.includes(opportunity.category)
      );
    }

    // Distance filter (only if user location is available and not virtual only)
    if (!virtualOnly && userLocation && distance[0] < 100) {
      filtered = filtered.filter(opportunity => 
        opportunity.distanceValue !== Number.MAX_VALUE && 
        opportunity.distanceValue <= distance[0]
      );
    }

    // Virtual filter (if virtualOnly is true, show only opportunities that could be virtual)
    // For now, we'll assume all opportunities can be virtual if needed
    // You can add a virtual field to your events table later if needed

    setFilteredOpportunities(filtered);
  }, [opportunities, searchInput, selectedCategories, distance, virtualOnly, userLocation]);

  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            id,
            title,
            organization_id,
            location,
            event_date,
            start_time,
            end_time,
            category,
            image_url,
            max_participants,
            current_participants,
            points,
            featured,
            description,
            icon_name,
            status,
            latitude,
            longitude,
            companies!organization_id (
              company_name
            )
          `)
          .eq('status', 'active')
          .order('event_date', { ascending: true });

        if (error) {
          throw error;
        }

        // Map DB fields to UI model with improved distance handling
        const mapped = (data || []).map((event: any) => {
          // Compose time string
          let time = 'TBA';
          if (event.start_time && event.end_time) {
            time = `${event.start_time.slice(0,5)} - ${event.end_time.slice(0,5)}`;
          }
          
          // Compose date string
          let date = 'Ongoing';
          if (event.event_date) {
            date = new Date(event.event_date).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          }
          
          // Calculate distance with improved logic
          const distanceInfo = formatDistance(userLocation, event.latitude, event.longitude);
          
          // Handle company name
          const companyName = event.companies?.company_name || 
                             (Array.isArray(event.companies) ? event.companies[0]?.company_name : null) ||
                             'Unknown Organization';
          
          // Get icon component dynamically
          const IconComponent = getIconComponent(event.icon_name);
          
          return {
            id: event.id,
            title: event.title,
            organization: companyName,
            location: event.location,
            date,
            time,
            category: event.category,
            image: event.image_url,
            participants: event.current_participants || 0,
            spots: event.max_participants,
            distance: distanceInfo.display,
            distanceValue: distanceInfo.value,
            points: event.points || 0,
            featured: event.featured,
            description: event.description,
            icon: IconComponent,
            latitude: event.latitude,
            longitude: event.longitude,
          };
        });
        
        setOpportunities(mapped);
        console.log('Mapped opportunities:', mapped);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOpportunities();
  }, [userLocation]);

  // Sort opportunities based on selected option
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (sortBy === 'distance') {
      // Sort by actual distance value, putting unavailable locations at the end
      if (a.distanceValue === Number.MAX_VALUE && b.distanceValue === Number.MAX_VALUE) return 0;
      if (a.distanceValue === Number.MAX_VALUE) return 1;
      if (b.distanceValue === Number.MAX_VALUE) return -1;
      return a.distanceValue - b.distanceValue;
    } else if (sortBy === 'date') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'points') {
      return b.points - a.points;
    }
    return 0;
  });

  if (loading) {
    return <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading opportunities...</div>;
  }
  
  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
    

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing <strong>{filteredOpportunities.length}</strong> of <strong>{opportunities.length}</strong> opportunities
            </span>
            {locationStatus === 'denied' && (
              <Badge variant="outline" className="ml-2 text-amber-600 border-amber-600">
                Location access denied
              </Badge>
            )}
            {locationStatus === 'unavailable' && (
              <Badge variant="outline" className="ml-2 text-gray-600 border-gray-600">
                Location unavailable
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <Tabs defaultValue="grid" value={view} onValueChange={setView}>
                <TabsList>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex-1 md:w-40">
              <Select defaultValue="distance" value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="points">Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>



        {filteredOpportunities.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            {opportunities.length === 0 ? 'No opportunities found.' : 'No opportunities match your filters.'}
          </div>
        ) : (
          <>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedOpportunities.map((opportunity) => {
                  const Icon = opportunity.icon;
                  
                  return (
                    <Card key={opportunity.id} className="overflow-hidden transition-all hover:shadow-lg">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={opportunity.image} 
                          alt={opportunity.title} 
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                        />
                        <Badge className="absolute top-3 right-3 bg-emerald-600 dark:bg-emerald-600">
                          {opportunity.category}
                        </Badge>
                        {opportunity.featured && (
                          <Badge className="absolute top-3 left-3 bg-amber-500 dark:bg-amber-500">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="pt-6">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-2">
                            <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {opportunity.points} points
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {opportunity.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          By {opportunity.organization}
                        </p>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                          {opportunity.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{opportunity.location}</span>
                            {opportunity.distanceValue !== Number.MAX_VALUE && (
                              <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-medium">
                                {opportunity.distance}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                            {opportunity.date}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                            {opportunity.time}
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex flex-col items-start pt-0">
                        <div className="w-full flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-400" />
                            <span>{opportunity.participants}/{opportunity.spots} joined</span>
                          </div>
                          <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                              style={{ width: `${(opportunity.participants / opportunity.spots) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <Link href={`/opportunities/${opportunity.id}`} className="w-full">
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                          onClick={() => onLearnMore && onLearnMore(opportunity.id)}>
                            Learn More
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedOpportunities.map((opportunity) => {
                  const Icon = opportunity.icon;
                  
                  return (
                    <Card key={opportunity.id} className="overflow-hidden transition-all hover:shadow-lg">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 relative">
                          <img 
                            src={opportunity.image} 
                            alt={opportunity.title} 
                            className="w-full h-48 md:h-full object-cover"
                          />
                          {opportunity.featured && (
                            <Badge className="absolute top-3 left-3 bg-amber-500 dark:bg-amber-500">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 p-6">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className="bg-emerald-600 dark:bg-emerald-600">
                              {opportunity.category}
                            </Badge>
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-1">
                                <Icon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {opportunity.points} points
                              </span>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {opportunity.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            By {opportunity.organization}
                          </p>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {opportunity.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                              <span className="truncate">{opportunity.location}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                              {opportunity.date}
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                              {opportunity.time}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Users className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-400" />
                                <span>{opportunity.participants}/{opportunity.spots}</span>
                              </div>
                              <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                                  style={{ width: `${(opportunity.participants / opportunity.spots) * 100}%` }}
                                ></div>
                              </div>
                              {opportunity.distanceValue !== Number.MAX_VALUE && (
                                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                  {opportunity.distance}
                                </div>
                              )}
                            </div>
                            
                            <Link href={`/opportunities/${opportunity.id}`}>
                              <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                                Learn More
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
        
        <div className="mt-8 flex justify-center">
          <Button variant="outline" className="mx-auto">
            Load More Opportunities
          </Button>
        </div>
      </div>
    </div>
  );
}