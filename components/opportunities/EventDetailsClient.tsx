"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  CheckCircle,
  Mail,
  Phone,
  Share2,
  Heart,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  organization_id: string;
  location: string;
  event_date: string;
  start_time: string;
  end_time: string;
  category: string;
  image_url: string;
  max_participants: number;
  current_participants: number;
  points: number;
  featured: boolean;
  description: string;
  icon_name?: string;
  status: string;
  latitude?: number;
  longitude?: number;
  companies?: {
    company_name: string;
  } | {
    company_name: string;
  }[];
}

export default function EventDetailsClient() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select(
          `
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
          `
        )
        .eq("id", id)
        .single();

      if (error) {
        setEvent(null);
      } else {
        setEvent(data);
      }
      setLoading(false);
    }
    if (id) fetchEvent();
  }, [id]);

  const handleRegister = () => {
    setIsRegistered(true);
    // In a real app, this would make an API call to register the user
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || '',
        text: event?.description || '',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Loading event details...
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-red-500">
            Event not found.
          </div>
        </div>
      </div>
    );
  }

  // Format data from backend
  const time = event.start_time && event.end_time
    ? `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)}`
    : "TBA";
  
  const date = event.event_date
    ? new Date(event.event_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Ongoing";

  const companyName = Array.isArray(event.companies)
    ? event.companies[0]?.company_name || "Unknown Organization"
    : event.companies?.company_name || "Unknown Organization";

  const spotsRemaining = event.max_participants - (event.current_participants || 0);
  const participationRate = ((event.current_participants || 0) / event.max_participants) * 100;

  // Mock data for features not in backend (you can add these to your database later)
  const mockRequirements = [
    "Minimum age: 12 years (under 16 must be accompanied by adult)",
    "Physical ability to participate in outdoor activities",
    "Commitment to stay for the full duration",
    "Follow safety guidelines and instructions"
  ];

  const mockSkills = ["No special skills required", "Environmental awareness", "Teamwork"];

  const mockImpact = {
    expectedParticipants: `${event.max_participants}+`,
    communityImpact: "High",
    pointsAwarded: `${event.points} pts`
  };

  const mockOrganizer = {
    name: "Event Coordinator",
    role: "Community Organizer",
    email: "info@organization.com",
    phone: "(555) 123-4567",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <Link href="/opportunities" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                  {event.category}
                </Badge>
                {event.featured && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    Featured
                  </Badge>
                )}
                <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{event.points} points</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {event.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Organized by {companyName}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div>{event.location}</div>
                    <div className="text-xs">Location details</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                  {date}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                  {time}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFavorited(!isFavorited)}
                className={cn(
                  "transition-colors",
                  isFavorited && "text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                )}
              >
                <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockRequirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Expected Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(mockImpact).map(([key, value]) => (
                    <div key={key} className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        {value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Participation
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {event.current_participants || 0}/{event.max_participants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${participationRate}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    {spotsRemaining} spots remaining
                  </div>
                </div>

                {spotsRemaining > 0 ? (
                  <div className="space-y-3">
                    {!isRegistered ? (
                      <Button 
                        onClick={handleRegister}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                        size="lg"
                      >
                        Register for Event
                      </Button>
                    ) : (
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="font-medium text-green-800 dark:text-green-200">
                          You're registered!
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Check your email for details
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      You'll earn {event.points} points for participating
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Event Full
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Join the waitlist to be notified if spots open up
                    </p>
                    <Button variant="outline" className="mt-3 w-full">
                      Join Waitlist
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {event.location}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Event Location
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mockOrganizer.avatar} alt={mockOrganizer.name} />
                    <AvatarFallback>{mockOrganizer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {mockOrganizer.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {mockOrganizer.role}
                    </div>
                    <div className="space-y-2">
                      <a 
                        href={`mailto:${mockOrganizer.email}`}
                        className="flex items-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {mockOrganizer.email}
                      </a>
                      <a 
                        href={`tel:${mockOrganizer.phone}`}
                        className="flex items-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {mockOrganizer.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}