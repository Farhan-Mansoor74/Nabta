"use client"
import { useState } from 'react';
import {
  Compass,
  Gift,
  BarChart2,
  Trophy,
  User,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Star,
  Bell,
  Settings
} from 'lucide-react';
import OpportunitiesHeader from '@/components/opportunities/header';
import OpportunitiesList from '@/components/opportunities/list';
import OpportunitiesFilters from '@/components/opportunities/filters';

export default function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState('explore');
  
  // Navigation items
  const navItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'chats', label: 'Chats', icon: MessageCircle },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  
  // State for chats
  const [activeChat, setActiveChat] = useState(0); // Store ID of active chat

  // Sample data for exclusive events
  const exclusiveEvents = [
    {
      id: 1,
      title: 'F1 Grand Prix Volunteering',
      date: 'June 15-17, 2025',
      location: 'Yas Marina Circuit',
      points: 1500,
      image: '/images/events/f1.jpg'
    },
    {
      id: 2,
      title: 'Middle East Film Festival Volunteering',
      date: 'May 20-25, 2025',
      location: 'Dubai Opera',
      points: 1200,
      image: '/images/events/film-festival.jpg'
    },
    {
      id: 3,
      title: 'Comic Con Volunteering',
      date: 'July 8-10, 2025',
      location: 'Dubai World Trade Centre',
      points: 1000,
      image: '/images/events/comic-con.jpg'
    }
  ];

  // Sample chats data
  const chats = [
    {
      id: 1,
      name: 'WWF Beach Cleanup Team',
      lastMessage: 'Reporting time is 7:30 AM at Jumeirah Beach entrance',
      timestamp: '1h ago',
      unread: 3,
      image: '/images/chats/wwf.jpg'
    },
    {
      id: 2,
      name: 'Dubai Sustainability Expo',
      lastMessage: 'Your payment of AED 300 has been processed. Thank you!',
      timestamp: '3h ago',
      unread: 0,
      image: '/images/chats/expo.jpg'
    },
    {
      id: 3,
      name: 'Mangrove Planting Initiative',
      lastMessage: "Please complete the feedback form for Sunday's event",
      timestamp: 'Yesterday',
      unread: 1,
      image: '/images/chats/mangrove.jpg'
    }
  ];

  // Dashboard data
  const userStats = {
    name: 'Madelyn',
    points: 973,
    rank: 4,
    eventsCompleted: 15,
    hoursVolunteered: 45,
    upcoming: 2
  };

  const recommendedEvents = [
    {
      id: 1,
      title: 'Sustainable Fashion Workshop',
      date: 'May 15, 2025',
      points: 150,
      location: 'Dubai Design District'
    },
    {
      id: 2,
      title: 'Solar Panel Installation',
      date: 'May 22, 2025',
      points: 300,
      location: 'Sustainable City'
    },
    {
      id: 3,
      title: 'Urban Farming Workshop',
      date: 'May 28, 2025',
      points: 200,
      location: 'Al Barsha Park'
    }
  ];

  const calendarEvents = [
    {
      id: 1,
      title: 'Beach Cleanup',
      date: 'May 12, 2025',
      time: '8:00 AM - 11:00 AM',
      location: 'Jumeirah Beach'
    },
    {
      id: 2,
      title: 'Tree Planting Day',
      date: 'May 18, 2025',
      time: '4:00 PM - 6:00 PM',
      location: 'Al Qudra Lakes'
    }
  ];

  // Rewards data
  const availableRewards = [
    {
      id: 1,
      title: 'Desert Conservation Experience',
      points: 800,
      image: '/images/rewards/desert.jpg',
      eligible: true
    },
    {
      id: 2,
      title: 'Sustainable Business Conference Pass',
      points: 1200,
      image: '/images/rewards/conference.jpg',
      eligible: false
    },
    {
      id: 3,
      title: 'Eco-Friendly Product Bundle',
      points: 500,
      image: '/images/rewards/bundle.jpg',
      eligible: true
    }
  ];

  const badges = [
    { id: 1, name: 'Beach Guardian', earned: true, image: '/images/badges/beach.svg' },
    { id: 2, name: 'Forest Friend', earned: true, image: '/images/badges/forest.svg' },
    { id: 3, name: 'Urban Innovator', earned: false, image: '/images/badges/urban.svg' },
    { id: 4, name: 'Water Protector', earned: true, image: '/images/badges/water.svg' },
    { id: 5, name: 'Wildlife Defender', earned: false, image: '/images/badges/wildlife.svg' }
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <div className="pb-20"> {/* Add padding at bottom to account for navbar */}
            <div className="pt-16 min-h-screen">
              <OpportunitiesHeader />
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-1">
                    <OpportunitiesFilters />
                  </div>
                  <div className="lg:col-span-3">
                    <OpportunitiesList />
                    
                    {/* Exclusive Events Section */}
                    <div className="mt-12">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Exclusive Events</h2>
                        <span className="text-emerald-600 text-sm font-medium">Your Points: 973</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Unlock premium volunteering experiences with your earned points
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exclusiveEvents.map(event => (
                          <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div className="h-40 bg-gray-300 dark:bg-gray-700 relative">
                              {/* Placeholder for event image */}
                              <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {event.points} points
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                                <Calendar className="h-4 w-4 mr-2" />
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
      
      case 'chats':
        // Find active chat from state
        const currentChat = chats.find(chat => chat.id === activeChat) || chats[0];
        
        // Sample messages for active chat
        const chatMessages = [
          { id: 1, text: "Hi everyone! Excited for tomorrow's event!", sender: "Jane", time: "10:30 AM", isSelf: false },
          { id: 2, text: "Me too! What time do we need to arrive?", sender: "Ali", time: "10:35 AM", isSelf: false },
          { id: 3, text: "The reporting time is 7:30 AM at Jumeirah Beach entrance. Don't forget to bring your volunteer ID and water bottle!", sender: "Organizer", time: "10:40 AM", isSelf: false },
          { id: 4, text: "Will transport be provided?", sender: "You", time: "10:45 AM", isSelf: true },
          { id: 5, text: "No, you'll need to arrange your own transportation. But there's free parking available near the entrance.", sender: "Organizer", time: "10:50 AM", isSelf: false },
          { id: 6, text: "Great, thanks for the information!", sender: "You", time: "10:55 AM", isSelf: true },
          { id: 7, text: "Is there a specific dress code?", sender: "Ahmed", time: "11:00 AM", isSelf: false },
          { id: 8, text: "Please wear comfortable clothes and closed shoes. We'll provide the event t-shirts on arrival.", sender: "Organizer", time: "11:05 AM", isSelf: false },
        ];
        
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
            <h1 className="text-2xl font-bold mb-6">Event Chats</h1>
            
            <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {/* Chats Sidebar */}
              <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search chats..."
                    className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-lg py-2 px-3 text-sm"
                  />
                </div>
                
                <div className="overflow-y-auto h-[calc(100%-56px)]">
                  {chats.map(chat => (
                    <div 
                      key={chat.id} 
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer border-b border-gray-200 dark:border-gray-700 ${
                        activeChat === chat.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                      onClick={() => setActiveChat(chat.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                            {chat.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {chat.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {chat.lastMessage}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{chat.timestamp}</span>
                          {chat.unread > 0 && (
                            <span className="mt-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Active Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center mr-3">
                    {currentChat.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-medium">{currentChat.name}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">12 participants</p>
                  </div>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-4">
                    {chatMessages.map(message => (
                      <div key={message.id} className={`flex ${message.isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                          message.isSelf 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-800'
                        }`}>
                          {!message.isSelf && (
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              {message.sender}
                            </p>
                          )}
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 text-right ${
                            message.isSelf ? 'text-emerald-200' : 'text-gray-500'
                          }`}>
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-l-lg py-2 px-3"
                    />
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-r-lg transition">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
            {/* Welcome/Summary Panel */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg text-white p-6 mb-8">
              <h1 className="text-2xl font-bold mb-4">Welcome back, {userStats.name}!</h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <p className="text-xs uppercase">Points</p>
                  <p className="text-xl font-bold">{userStats.points}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <p className="text-xs uppercase">Rank</p>
                  <p className="text-xl font-bold">#{userStats.rank}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <p className="text-xs uppercase">Events</p>
                  <p className="text-xl font-bold">{userStats.eventsCompleted}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <p className="text-xs uppercase">Hours</p>
                  <p className="text-xl font-bold">{userStats.hoursVolunteered}</p>
                </div>
              </div>
            </div>
            
            {/* Recommended Events */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recommendedEvents.map(event => (
                  <div key={event.id} className="py-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{event.date}</span>
                        <MapPin className="h-4 w-4 ml-3 mr-1" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs font-medium px-2 py-1 rounded mr-3">
                        {event.points} pts
                      </span>
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1 rounded transition">
                        Sign Up
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Calendar View */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Your Calendar</h2>
                <button className="text-emerald-600 text-sm font-medium">View All</button>
              </div>
              
              {/* Simple calendar visualization */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="text-center mb-4">
                  <h3 className="font-medium">May 2025</h3>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  <div>Su</div>
                  <div>Mo</div>
                  <div>Tu</div>
                  <div>We</div>
                  <div>Th</div>
                  <div>Fr</div>
                  <div>Sa</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {[...Array(31)].map((_, i) => {
                    // Highlight days with events (12 and 18)
                    const isEventDay = [12, 18].includes(i + 1);
                    const isToday = i + 1 === 5; // Assuming today is May 5
                    
                    return (
                      <div 
                        key={i} 
                        className={`py-1 rounded-full text-sm ${
                          isEventDay 
                            ? 'bg-emerald-600 text-white' 
                            : isToday 
                              ? 'border border-emerald-600 text-emerald-600' 
                              : ''
                        }`}
                      >
                        {i + 1 <= 31 ? i + 1 : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Upcoming events list */}
              <h3 className="font-medium mb-3">Upcoming Events</h3>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {calendarEvents.map(event => (
                  <div key={event.id} className="py-3">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="grid grid-cols-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center mt-1 col-span-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'rewards':
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Rewards Center</h1>
              <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-3 py-1 rounded-full">
                <span className="font-medium">{userStats.points} points available</span>
              </div>
            </div>
            
            {/* Rewards Grid */}
            <h2 className="text-xl font-medium mb-4">Available Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {availableRewards.map(reward => (
                <div key={reward.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="h-40 bg-gray-300 dark:bg-gray-700 relative">
                    {/* Placeholder for reward image */}
                    <div className="absolute top-3 right-3 bg-gray-800 dark:bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {reward.points} points
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-3">{reward.title}</h3>
                    <button 
                      className={`w-full py-2 rounded-md font-medium transition ${
                        reward.eligible && userStats.points >= reward.points
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {reward.eligible && userStats.points >= reward.points ? 'Redeem Now' : 'Not Enough Points'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Badges Section */}
            <h2 className="text-xl font-medium mb-4">Your Badges</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      badge.earned 
                        ? 'bg-emerald-100 dark:bg-emerald-900' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {/* Badge icon placeholder */}
                      {badge.earned ? (
                        <Star className={`h-8 w-8 text-emerald-600 dark:text-emerald-400`} />
                      ) : (
                        <Star className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      badge.earned 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {badge.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {badge.earned ? 'Earned' : 'Locked'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <div className="w-24 h-24 rounded-full bg-emerald-200 dark:bg-emerald-900 flex items-center justify-center mb-4 sm:mb-0 sm:mr-6">
                  <User className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold mb-1">Madelyn Dias</h1>
                  <div className="flex items-center justify-center sm:justify-start mb-2">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs px-2 py-1 rounded">
                      Environmental Champion
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Dubai, United Arab Emirates</p>
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
            
            {/* Tabs for Profile Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button className="px-6 py-4 text-emerald-600 dark:text-emerald-500 border-b-2 border-emerald-600 dark:border-emerald-500 font-medium">
                  RECENT EVENTS
                </button>
                <button className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  E-WALLET
                </button>
              </div>
              
              {/* Recent Events List */}
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
            
            {/* Settings Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    <span>Notifications</span>
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
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {renderContent()}
      
      {/* Bottom Navigation Bar - Fixed at bottom */}
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
                    ? 'text-emerald-600 dark:text-emerald-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-500' : ''}`} />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}