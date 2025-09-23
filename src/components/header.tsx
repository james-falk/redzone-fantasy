'use client';

import { useState } from 'react';
import { Menu, X, Search, User } from 'lucide-react';
import SimpleThemeToggle from './simple-theme-toggle';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold">
              <span className="text-red-600">FRZ</span>
              <span className="text-gray-900 header-text">FANTASY RED ZONE</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="header-nav-link font-medium">
              ANALYSIS
            </a>
            <a href="#" className="header-nav-link font-medium">
              RANKINGS
            </a>
            <a href="#" className="header-nav-link font-medium">
              SOURCES
            </a>
            <a href="#" className="header-nav-link font-medium">
              TOOLS
            </a>
            <a href="#" className="header-nav-link font-medium">
              VIDEOS
            </a>
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 header-button transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 header-button transition-colors">
              <User className="w-5 h-5" />
            </button>
            <SimpleThemeToggle />
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              GET PREMIUM
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium">
                ANALYSIS
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium">
                RANKINGS
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium">
                SOURCES
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium">
                TOOLS
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium">
                VIDEOS
              </a>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Theme</span>
                <SimpleThemeToggle />
              </div>
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors w-full">
                GET PREMIUM
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
