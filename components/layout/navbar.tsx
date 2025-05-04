"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LucideLeaf, Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from './theme-toggle';

const publicRoutes = [
  { name: 'Home', href: '/' },
  { name: 'Opportunities', href: '/opportunities' },
  { name: 'For Companies', href: '/for-companies' },
  { name: 'About Us', href: '/about' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  // Determine if we're on a logged-in page
  const isLoggedIn = pathname === '/volunteer-dashboard';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 text-lg md:text-xl font-bold">
          <LucideLeaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <span className={cn(
            "transition-colors duration-300",
            isScrolled || isMenuOpen ? "text-gray-900 dark:text-gray-100" : "text-gray-900 dark:text-white"
          )}>
            Nabta
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {!isLoggedIn && (
            <div className="flex space-x-6">
              {publicRoutes.map((route) => (
                <Link
                  key={route.name}
                  href={route.href}
                  className={cn(
                    "font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400",
                    isScrolled 
                      ? "text-gray-700 dark:text-gray-300" 
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {route.name}
                </Link>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-5">
            <ThemeToggle />
            {isLoggedIn ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={() => window.location.href = '/'}
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center space-x-3">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-lg py-4 px-4 transition-all duration-300 ease-in-out">
          <nav className="flex flex-col space-y-4">
            {!isLoggedIn ? (
              // Show regular navigation for non-logged in users
              <>
                {publicRoutes.map((route) => (
                  <Link
                    key={route.name}
                    href={route.href}
                    className="font-medium px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {route.name}
                  </Link>
                ))}
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              // Show logout option for logged in users
              <div className="flex flex-col space-y-2 pt-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-center flex items-center"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.location.href = '/';
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}