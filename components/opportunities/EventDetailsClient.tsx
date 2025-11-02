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
  AlertCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface EventDetails {
  required_skills?: string[];
  preferred_skills?: string[];
  materials_provided?: string;
  bring_your_own?: string[];
  accessibility_info?: string;
  parking_info?: string;
  public_transport_info?: string;
  expected_participants?: number;
  community_impact_level?: string;
  impact_metrics?: Record<string, any>;
}

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
  views?: number;
  companies?: {
    company_name: string;
  } | {
    company_name: string;
  }[];
  event_details?: EventDetails | EventDetails[];
}

export default function EventDetailsClient() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    motivation: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          setCurrentUserId(user.id);
          setUserEmail(user.email || "");
          setUserName(user.user_metadata?.username || user.email?.split('@')[0] || "");

          // Pre-fill form
          setSignupForm({
            fullName: user.user_metadata?.username || "",
            email: user.email || "",
            phone: user.user_metadata?.phone || "",
            motivation: ""
          });
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        // First fetch the basic event data
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select(`
            id,
            title,
            company_id,
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
            status
          `)
          .eq("id", id)
          .single();

        console.log('Event fetch result:', { data: eventData, error: eventError });

        if (eventError) {
          console.error('Error fetching event:', eventError);
          setEvent(null);
          setLoading(false);
          return;
        }

        // Fetch company data separately
        const { data: companyData } = await supabase
          .from("companies")
          .select("company_name")
          .eq("id", eventData.company_id)
          .single();

        // Fetch event details separately (if table exists)
        const { data: detailsData } = await supabase
          .from("event_details")
          .select(`
            required_skills,
            preferred_skills,
            materials_provided,
            bring_your_own,
            accessibility_info,
            parking_info,
            public_transport_info,
            expected_participants,
            community_impact_level,
            impact_metrics
          `)
          .eq("event_id", id)
          .maybeSingle();

        // Combine all data
        const combinedData = {
          ...eventData,
          companies: companyData || { company_name: "Unknown Organization" },
          event_details: detailsData || {}
        };

        setEvent(combinedData);

        // Track view (fire and forget - don't wait for response)
        fetch(`/api/companies/opportunities/${id}/views`, {
          method: 'POST',
          credentials: 'include'
        }).catch(err => console.error('Failed to track view:', err));
      } catch (err) {
        console.error('Unexpected error fetching event:', err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchEvent();
  }, [id]);

  // Check if user is already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (!currentUserId || !id) return;

      try {
        // Get volunteer profile
        const { data: volunteer } = await supabase
          .from('volunteers')
          .select('id')
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (volunteer) {
          // Check if registered
          const { data: registration } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('event_id', id)
            .eq('volunteer_id', volunteer.id)
            .maybeSingle();

          setIsRegistered(!!registration);
        }
      } catch (error) {
        console.error('Error checking registration:', error);
      }
    };

    checkRegistration();
  }, [currentUserId, id]);

  const handleRegister = () => {
    if (!currentUserId) {
      alert('Please log in to register for events');
      router.push('/login');
      return;
    }
    setShowSignupModal(true);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      alert('Please log in to sign up for events');
      return;
    }

    if (!event) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/event-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          volunteerId: currentUserId,
          fullName: signupForm.fullName,
          email: signupForm.email,
          phone: signupForm.phone,
          motivation: signupForm.motivation
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to sign up');
        return;
      }

      alert('Successfully signed up for the event!');
      setShowSignupModal(false);
      setIsRegistered(true);

      // Refresh event data to update participant count
      const { data: eventData } = await supabase
        .from("events")
        .select('*')
        .eq("id", event.id)
        .single();

      if (eventData) {
        setEvent(prev => prev ? { ...prev, current_participants: eventData.current_participants } : null);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Failed to sign up for event');
    } finally {
      setSubmitting(false);
    }
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

  // Extract event details (handle both single object and array from Supabase)
  const eventDetails = Array.isArray(event.event_details)
    ? event.event_details[0]
    : event.event_details;

  // Extract required and preferred skills
  const requiredSkills = eventDetails?.required_skills || [];
  const preferredSkills = eventDetails?.preferred_skills || [];
  const allSkills = [...requiredSkills, ...preferredSkills];

  // Extract impact data
  const impactData = {
    expectedParticipants: eventDetails?.expected_participants
      ? `${eventDetails.expected_participants}+`
      : `${event.max_participants}+`,
    communityImpact: eventDetails?.community_impact_level
      ? eventDetails.community_impact_level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      : "Medium",
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
          <Link href="/volunteer-dashboard" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mb-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image on error
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="h-24 w-24 text-gray-400 dark:text-gray-600" />
                </div>
              )}
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

            {/* Requirements - Materials & What to Bring */}
            {(eventDetails?.materials_provided || eventDetails?.bring_your_own) && (
              <Card>
                <CardHeader>
                  <CardTitle>What We Provide & What to Bring</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {eventDetails?.materials_provided && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Materials Provided:</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{eventDetails.materials_provided}</p>
                    </div>
                  )}
                  {eventDetails?.bring_your_own && eventDetails.bring_your_own.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Please Bring:</h4>
                      <ul className="space-y-1">
                        {eventDetails.bring_your_own.map((item, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {allSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {requiredSkills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Required:</h4>
                      <div className="flex flex-wrap gap-2">
                        {requiredSkills.map((skill, index) => (
                          <Badge key={index} className="bg-emerald-600 hover:bg-emerald-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {preferredSkills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Preferred:</h4>
                      <div className="flex flex-wrap gap-2">
                        {preferredSkills.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {allSkills.length === 0 && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No special skills required - everyone is welcome!</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Logistics - Accessibility & Transport */}
            {(eventDetails?.accessibility_info || eventDetails?.parking_info || eventDetails?.public_transport_info) && (
              <Card>
                <CardHeader>
                  <CardTitle>Getting There & Accessibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {eventDetails?.accessibility_info && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Accessibility
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{eventDetails.accessibility_info}</p>
                    </div>
                  )}
                  {eventDetails?.parking_info && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Parking
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{eventDetails.parking_info}</p>
                    </div>
                  )}
                  {eventDetails?.public_transport_info && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Public Transport
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{eventDetails.public_transport_info}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Expected Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(impactData).map(([key, value]) => (
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

      {/* Signup Modal */}
      {showSignupModal && event && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 rounded-t-xl">
              <div className="flex justify-between items-start text-white">
                <div>
                  <h2 className="text-xl font-bold mb-1">Sign Up for Event</h2>
                  <p className="text-emerald-100 text-sm">Join this volunteering opportunity</p>
                </div>
                <button
                  onClick={() => setShowSignupModal(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {event.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                    <span>{event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBA'}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-emerald-600" />
                    <span>{event.points} points reward</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignupSubmit}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your full name"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm({...signupForm, fullName: e.target.value})}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your phone number"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Why do you want to volunteer for this event?
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Tell us about your motivation..."
                      value={signupForm.motivation}
                      onChange={(e) => setSignupForm({...signupForm, motivation: e.target.value})}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      required
                      disabled={submitting}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      I agree to the terms and conditions and understand the volunteer requirements for this event.
                    </span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSignupModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Signing up...' : 'Sign Me Up!'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}