"use client";
import { useRouter, usePathname } from "next/navigation";
import { Compass, BarChart2, Gift, User } from "lucide-react";

const navItems = [
  { id: 'explore', label: 'Explore', icon: Compass, href: '/volunteer-dashboard?tab=explore' },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2, href: '/volunteer-dashboard?tab=dashboard' },
  { id: 'rewards', label: 'Rewards', icon: Gift, href: '/volunteer-dashboard?tab=rewards' },
  { id: 'profile', label: 'Profile', icon: User, href: '/volunteer-dashboard?tab=profile' },
];

export default function VolunteerTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 flex justify-around py-2">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`flex flex-col items-center text-xs px-2 py-1 focus:outline-none ${
            pathname.includes(item.href.split('?')[0]) ? "text-emerald-600" : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={() => router.push(item.href)}
        >
          <item.icon className="h-5 w-5 mb-1" />
          {item.label}
        </button>
      ))}
    </nav>
  );
}