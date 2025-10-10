"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Compass,
  Gift,
  BarChart2,
  Trophy,
  User,
  MessageCircle,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  ChevronLeft,
  Star,
  Bell,
  Settings,
  Filter,
  HeartOffIcon,
  HeartIcon,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OpportunitiesHeader from "@/components/opportunities/header";
import OpportunitiesList from "@/components/opportunities/list";
import OpportunitiesFilters from "@/components/opportunities/filters";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export type CalendarEvent = {
  id: string | number;
  title: string;
  start: string;
  end?: string;
  location?: string;
  points?: number;
  category?: string;
};

function CalendarView({
  month,
  onPrevMonth,
  onNextMonth,
  events,
  onSelectEvent,
}: {
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  events: CalendarEvent[];
  onSelectEvent?: (id: string | number) => void;
}) {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDay = new Date(firstOfMonth);
  startDay.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    cells.push(d);
  }

  const ymd = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const s = new Date(ev.start);
    const e = ev.end ? new Date(ev.end) : new Date(ev.start);
    const cursor = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const last = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    while (cursor <= last) {
      const key = ymd(cursor);
      const arr = eventsByDay.get(key) ?? [];
      arr.push(ev);
      eventsByDay.set(key, arr);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const monthLabel = month.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
  const todayKey = ymd(new Date());

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Environment": return "bg-green-500";
      case "Community": return "bg-blue-500";
      case "Healthcare": return "bg-red-500";
      case "Education": return "bg-purple-500";
      default: return "bg-emerald-500";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6">
        <div className="flex justify-between items-center text-white">
          <h2 className="text-2xl font-bold">Your Calendar</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onPrevMonth}
              className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="mx-4 font-semibold text-lg min-w-[140px] text-center">
              {monthLabel}
            </div>
            <button
              onClick={onNextMonth}
              className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
            <div key={day} className="text-center py-3">
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {day.slice(0, 3)}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((d) => {
            const key = ymd(d);
            const inMonth = d.getMonth() === month.getMonth();
            const isToday = key === todayKey;
            const dayEvents = eventsByDay.get(key) ?? [];
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={key}
                className={[
                  "relative min-h-[80px] p-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer",
                  inMonth 
                    ? "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-emerald-300" 
                    : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60",
                  isToday ? "ring-2 ring-emerald-500 ring-offset-2 bg-emerald-50 dark:bg-emerald-900/20" : "",
                ].join(" ")}
              >
                <div className={[
                  "text-sm font-semibold mb-1",
                  isToday ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white",
                  !inMonth ? "text-gray-400 dark:text-gray-500" : ""
                ].join(" ")}>
                  {d.getDate()}
                </div>

                {hasEvents && (
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <button
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent?.(ev.id);
                        }}
                        className={[
                          "w-full text-left px-2 py-1 rounded text-xs font-medium text-white truncate",
                          "hover:scale-105 transition-transform duration-200",
                          getCategoryColor(ev.category)
                        ].join(" ")}
                        title={`${ev.title} - ${ev.location || 'No location'}`}
                      >
                        {ev.title}
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    motivation: ""
  });

  // Get current user from Supabase auth
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [authLoading, setAuthLoading] = useState(true);

  // Get authenticated user on mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (user) {
          setCurrentUserId(user.id);
          console.log('Logged in user ID:', user.id);
        } else {
          console.warn('No authenticated user found');
          // For testing, you can set a hardcoded ID here:
          // setCurrentUserId("your-test-user-id");
        }
      } catch (error) {
        console.error('Error getting user:', error);
        // For testing, you can set a hardcoded ID here:
        // setCurrentUserId("your-test-user-id");
      } finally {
        setAuthLoading(false);
      }
    };
    
    getUser();
  }, []);

  // User stats
  const [userStats, setUserStats] = useState({
    name: "User",
    points: 0,
    rank: 0,
    eventsCompleted: 0,
    hoursVolunteered: 0,
    upcoming: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Recommended events
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  // Calendar
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  // Upcoming events
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [distance, setDistance] = useState<number[]>([25]);
  const [virtualOnly, setVirtualOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const router = useRouter();

  // 1️⃣ Fetch User Stats
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUserId) return;
      
      try {
        setLoadingStats(true);
        const res = await fetch(`${API_BASE}/api/user-stats?userId=${currentUserId}`);
        if (!res.ok) throw new Error('Failed to fetch user stats');
        const data = await res.json();
        setUserStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [currentUserId]);

  // 2️⃣ Fetch Recommended Events
  useEffect(() => {
    const fetchRecommended = async () => {
      if (!currentUserId) return;
      
      try {
        setLoadingRecommended(true);
        const res = await fetch(`${API_BASE}/api/recommended-events?userId=${currentUserId}&limit=3`);
        if (!res.ok) throw new Error('Failed to fetch recommended events');
        const data = await res.json();
        setRecommendedEvents(data);
      } catch (error) {
        console.error('Error fetching recommended events:', error);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchRecommended();
  }, [currentUserId]);

  // 4️⃣ Fetch Calendar Events
  const fetchRange = useMemo(() => {
    const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const end = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    
    const bufferedStart = new Date(start);
    bufferedStart.setDate(start.getDate() - 7);
    const bufferedEnd = new Date(end);
    bufferedEnd.setDate(end.getDate() + 7);

    return { 
      startISO: bufferedStart.toISOString(), 
      endISO: bufferedEnd.toISOString() 
    };
  }, [monthCursor]);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      if (!currentUserId) return;
      
      try {
        setIsLoadingCalendar(true);
        const res = await fetch(
          `${API_BASE}/api/calendar-events?start=${encodeURIComponent(fetchRange.startISO)}&end=${encodeURIComponent(fetchRange.endISO)}`
        );
        if (!res.ok) throw new Error('Failed to fetch calendar events');
        const data = await res.json();
        setCalendarEvents(data);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        setCalendarEvents([]);
      } finally {
        setIsLoadingCalendar(false);
      }
    };

    fetchCalendarEvents();
  }, [fetchRange.startISO, fetchRange.endISO, currentUserId]);

  // 5️⃣ Fetch Upcoming Events
  useEffect(() => {
    const fetchUpcoming = async () => {
      if (!currentUserId) return;
      
      try {
        setLoadingUpcoming(true);
        const res = await fetch(`${API_BASE}/api/upcoming-events?userId=${currentUserId}`);
        if (!res.ok) throw new Error('Failed to fetch upcoming events');
        const data = await res.json();
        setUpcomingEvents(data);
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
        setUpcomingEvents([]);
      } finally {
        setLoadingUpcoming(false);
      }
    };

    if (activeTab === 'dashboard' && currentUserId) {
      fetchUpcoming();
    }
  }, [activeTab, currentUserId]);

  // 3️⃣ Sign Up for Event
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      alert('Please log in to sign up for events');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/event-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
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
      setSelectedEvent(null);
      setSignupForm({ fullName: "", email: "", phone: "", motivation: "" });
      
      // Refresh recommended events
      const refreshRes = await fetch(`${API_BASE}/api/recommended-events?userId=${currentUserId}&limit=3`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setRecommendedEvents(refreshData);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Failed to sign up for event');
    }
  };

  const handleSignup = (event: any) => {
    setSelectedEvent(event);
    setShowSignupModal(true);
  };

  const handleLearnMore = (eventId: number | string) => {
    console.log(`View details for event ID: ${eventId}`);
  };

  const navItems = [
    { id: "explore", label: "Explore", icon: Compass },
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "rewards", label: "Rewards", icon: Gift },
    { id: "profile", label: "Profile", icon: User },
  ];

  const exclusiveEvents = [
    {
      id: 1,
      title: "F1 Grand Prix Volunteering",
      date: "June 15-17, 2025",
      location: "Yas Marina Circuit",
      points: 1500,
    },
    {
      id: 2,
      title: "Middle East Film Festival",
      date: "May 20-25, 2025",
      location: "Dubai Opera",
      points: 1200,
    },
    {
      id: 3,
      title: "Comic Con Volunteering",
      date: "July 8-10, 2025",
      location: "Dubai World Trade Centre",
      points: 1000,
    },
  ];

  const availableRewards = [
    { id: 1, title: "Desert Conservation Experience", points: 800, eligible: true },
    { id: 2, title: "Sustainable Business Conference Pass", points: 1200, eligible: false },
    { id: 3, title: "Eco-Friendly Product Bundle", points: 500, eligible: true },
  ];

  const badges = [
    { id: 1, name: "Beach Guardian", earned: true },
    { id: 2, name: "Forest Friend", earned: true },
    { id: 3, name: "Urban Innovator", earned: false },
    { id: 4, name: "Water Protector", earned: true },
    { id: 5, name: "Wildlife Defender", earned: false },
  ];

  const favoritedEvents = [
    {
      id: 2,
      title: "Solar Panel Installation",
      date: "May 22, 2025",
      points: 300,
      location: "Sustainable City",
    },
    {
      id: 3,
      title: "Urban Farming Workshop",
      date: "May 28, 2025",
      points: 200,
      location: "Al Barsha Park",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "explore":
        return (
          <div className="pb-20">
            <div className="pt-16 min-h-screen">
              <OpportunitiesHeader />
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                  <div className="xl:col-span-1 hidden xl:block">
                    <OpportunitiesFilters
                      distance={distance}
                      setDistance={setDistance}
                      virtualOnly={virtualOnly}
                      setVirtualOnly={setVirtualOnly}
                      selectedCategories={selectedCategories}
                      setSelectedCategories={setSelectedCategories}
                      searchInput={searchInput}
                      setSearchInput={setSearchInput}
                    />
                  </div>
                  <div className="xl:col-span-3">
                    <div className="xl:hidden mb-6">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {showMobileFilters ? "Hide Filters" : "Show Filters"}
                      </Button>

                      {showMobileFilters && (
                        <div className="mt-4">
                          <OpportunitiesFilters
                            distance={distance}
                            setDistance={setDistance}
                            virtualOnly={virtualOnly}
                            setVirtualOnly={setVirtualOnly}
                            selectedCategories={selectedCategories}
                            setSelectedCategories={setSelectedCategories}
                            searchInput={searchInput}
                            setSearchInput={setSearchInput}
                          />
                        </div>
                      )}
                    </div>

                    <OpportunitiesList
                      searchInput={searchInput}
                      distance={distance}
                      virtualOnly={virtualOnly}
                      selectedCategories={selectedCategories}
                      showMobileFilters={showMobileFilters}
                      setShowMobileFilters={setShowMobileFilters}
                      onLearnMore={handleLearnMore}
                    />

                    <div className="mt-12">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Exclusive Events</h2>
                        <span className="text-emerald-600 text-sm font-medium">
                          Your Points: {userStats.points}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Unlock premium volunteering experiences with your earned points
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exclusiveEvents.map((event) => (
                          <div
                            key={event.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                          >
                            <div className="h-40 bg-gray-300 dark:bg-gray-700 relative">
                              <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {event.points} points
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                <span className="text-sm">{event.date}</span>
                              </div>
                              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="text-sm">{event.location}</span>
                              </div>
                              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-medium transition">
                                Redeem Points
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "dashboard":
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg text-white p-6 mb-8">
              <h1 className="text-2xl font-bold mb-4">
                Welcome back, {loadingStats ? "..." : userStats.name}!
              </h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <p className="text-xs uppercase">Points</p>
                  <p className="text-xl font-bold">{loadingStats ? "..." : userStats.points}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <p className="text-xs uppercase">Rank</p>
                  <p className="text-xl font-bold">#{loadingStats ? "..." : userStats.rank}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <p className="text-xs uppercase">Events</p>
                  <p className="text-xl font-bold">{loadingStats ? "..." : userStats.eventsCompleted}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <p className="text-xs uppercase">Hours</p>
                  <p className="text-xl font-bold">{loadingStats ? "..." : userStats.hoursVolunteered}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
              {loadingRecommended ? (
                <div className="text-center py-8 text-gray-500">Loading recommendations...</div>
              ) : recommendedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recommendations available</div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recommendedEvents.map((event) => (
                    <div key={event.id} className="py-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{event.date}</span>
                          <MapPin className="h-4 w-4 ml-3 mr-1" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs font-medium px-2 py-1 rounded mr-3">
                          {event.points} pts
                        </span>
                        <button 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1 rounded transition"
                          onClick={() => handleSignup(event)}
                        >
                          Sign Up
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <CalendarView
              month={monthCursor}
              onPrevMonth={() =>
                setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
              }
              onNextMonth={() =>
                setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
              }
              events={calendarEvents}
              onSelectEvent={(id) => handleLearnMore(id)}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Upcoming Events</h3>
                {loadingUpcoming && (
                  <span className="text-sm text-emerald-600 animate-pulse">Loading...</span>
                )}
              </div>

              <div className="space-y-4">
                {upcomingEvents.length === 0 && !loadingUpcoming ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No upcoming events
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Browse opportunities to get started!
                    </p>
                    <button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      onClick={() => setActiveTab("explore")}
                    >
                      Explore Opportunities
                    </button>
                  </div>
                ) : (
                  upcomingEvents.map((event) => {
                    const d = new Date(event.start);
                    const dateStr = d.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    const timeStr = d.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div 
                        key={event.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() => handleLearnMore(event.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                              {event.title}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2 text-emerald-600" />
                                <span>{dateStr}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                                <span>{timeStr}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center sm:col-span-2">
                                  <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                            {event.category && (
                              <div className="mt-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  event.category === 'Environment' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  event.category === 'Community' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                  event.category === 'Healthcare' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  event.category === 'Education' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>
                                  {event.category}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {event.points && (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-sm font-semibold px-3 py-1 rounded-full">
                                {event.points} pts
                              </span>
                            )}
                            <button 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLearnMore(event.id);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );

      case "rewards":
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Rewards Center</h1>
              <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-3 py-1 rounded-full">
                <span className="font-medium">{userStats.points} points available</span>
              </div>
            </div>

            <h2 className="text-xl font-medium mb-4">Available Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {availableRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="h-40 bg-gray-300 dark:bg-gray-700 relative">
                    <div className="absolute top-3 right-3 bg-gray-800 dark:bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {reward.points} points
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-3">{reward.title}</h3>
                    <button
                      className={`w-full py-2 rounded-md font-medium transition ${
                        reward.eligible && userStats.points >= reward.points
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {reward.eligible && userStats.points >= reward.points
                        ? "Redeem Now"
                        : "Not Enough Points"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-medium mb-4">Your Badges</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        badge.earned
                          ? "bg-emerald-100 dark:bg-emerald-900"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      {badge.earned ? (
                        <Star className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Star className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        badge.earned
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {badge.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {badge.earned ? "Earned" : "Locked"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <div className="w-24 h-24 rounded-full bg-emerald-200 dark:bg-emerald-900 flex items-center justify-center mb-4 sm:mb-0 sm:mr-6">
                  <User className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold mb-1">{userStats.name}</h1>
                  <div className="flex items-center justify-center sm:justify-start mb-2">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs px-2 py-1 rounded">
                      Environmental Champion
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Dubai, United Arab Emirates
                  </p>
                  <div className="flex justify-center sm:justify-start space-x-6">
                    <div className="text-center">
                      <p className="font-bold text-lg">{userStats.points}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">POINTS</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">#{userStats.rank}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">RANK</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{userStats.eventsCompleted}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">EVENTS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button className="px-6 py-4 text-emerald-600 dark:text-emerald-500 border-b-2 border-emerald-600 dark:border-emerald-500 font-medium">
                  RECENT EVENTS
                </button>
                <button className="px-6 py-4 text-gray-500 dark:text-gray-400">E-WALLET</button>
              </div>

              <div className="p-4">
                <div className="border-b border-gray-200 dark:border-gray-700 py-4">
                  <div className="flex items-start">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0 flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1ST MAY, SAT • 3:00 PM</p>
                      <h3 className="font-medium mt-1">WWF - Protecting Biodiversity</h3>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 py-4">
                  <div className="flex items-start">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0 flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1ST MAY, SAT • 2:00 PM</p>
                      <h3 className="font-medium mt-1">Waste management drive</h3>
                    </div>
                  </div>
                </div>

                <div className="py-4">
                  <div className="flex items-start">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0 flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1ST MAY, SAT • 2:00 PM</p>
                      <h3 className="font-medium mt-1">United Dubai volunteering</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    <span>Notifications</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setShowFavorites(true)}
                >
                  <div className="flex items-center">
                    <HeartIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    <span>Favorites</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    <span>Settings</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    <span>Help & Support</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {showFavorites && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Your Favorites</h2>
                  <button
                    className="text-emerald-600 text-sm font-medium"
                    onClick={() => setShowFavorites(false)}
                  >
                    Back
                  </button>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {favoritedEvents.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400 py-8 text-center">
                      You haven't favorited any events yet.
                    </div>
                  ) : (
                    favoritedEvents.map((event) => (
                      <div key={event.id} className="py-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>{event.date}</span>
                            <MapPin className="h-4 w-4 ml-3 mr-1" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs font-medium px-2 py-1 rounded mr-3">
                            {event.points} pts
                          </span>
                          <button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1 rounded transition"
                            onClick={() => handleLearnMore(event.id)}
                          >
                            Learn More
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {renderContent()}

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`flex flex-col items-center justify-center ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showSignupModal && selectedEvent && (
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
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {selectedEvent.title}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-emerald-600" />
                    <span>{selectedEvent.date}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-emerald-600" />
                    <span>{selectedEvent.points} points reward</span>
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
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      required
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
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Sign Me Up!
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