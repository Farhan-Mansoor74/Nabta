"use client"

import { useState } from 'react';
import { 
  Compass, 
  Gift, 
  BarChart2, 
  Trophy, 
  User
} from 'lucide-react';
import OpportunitiesHeader from '@/components/opportunities/header';
import OpportunitiesList from '@/components/opportunities/list';
import OpportunitiesFilters from '@/components/opportunities/filters';

export default function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState('explore');

  // Navigation items
  const navItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <div className="pb-20"> {/* Add padding at bottom to account for navbar */}
            <div className="pt-16 min-h-screen">
              <OpportunitiesHeader />
              <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-1">
                    <OpportunitiesFilters />
                  </div>
                  <div className="lg:col-span-3">
                    <OpportunitiesList />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
            <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Dashboard content will go here</p>
          </div>
        );
      case 'leaderboard':
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
            <h1 className="text-2xl font-bold mb-6">Environmental Heroes Leaderboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Leaderboard content will go here</p>
          </div>
        );
      case 'rewards':
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
          <p className="text-gray-600 dark:text-gray-400">Rewards content will go here</p>
          </div>
        );
      case 'profile':
        return (
          <div className="container mx-auto px-4 py-8 pb-24 pt-24">
          <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Profile content will go here</p>
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