'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, LogOut, Plus, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onAddSchoolClick?: () => void;
}

export default function Header({ onAddSchoolClick }: HeaderProps) {
  const { currentView, setCurrentView, userSchoolName, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (view: 'admin' | 'coach') => {
    setDropdownOpen(false);
    if (view === 'coach') {
      const coachPortalUrl = process.env.NEXT_PUBLIC_COACH_PORTAL_URL;
      if (!coachPortalUrl) {
        console.error(
          'CRITICAL CONFIGURATION ERROR: NEXT_PUBLIC_COACH_PORTAL_URL environment variable is missing.'
        );
        return;
      }
      window.open(coachPortalUrl, '_blank');
    } else {
      setCurrentView('admin');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-[#0f1115] border-b border-[#2D333B] sticky top-0 z-30 px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side: Brand Logo & Section Title */}
        <div className="flex items-center space-x-4">
          <img
            src="/assets/logo.png"
            alt="LVL UP Logo"
            className="h-14 w-auto object-contain cursor-pointer"
            onClick={() => router.push('/dashboard')}
          />
          <div className="h-6 w-px bg-[#2D333B]" />
          <div className="flex items-center space-x-3">
            <span className="text-lg font-bold text-white tracking-wide uppercase">ADMIN PANEL</span>
            <span className="text-xs font-semibold text-[#FAE035] tracking-wide">
              Platform Admin
            </span>
          </div>
        </div>

        {/* Right Side: Account Role Switcher & Actions */}
        <div className="flex items-center space-x-4">
          {/* Role Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 bg-[#171B20] hover:bg-[#262A33] border border-[#2D333B] text-slate-200 text-xs font-medium px-3.5 py-2 rounded-lg transition duration-200 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#FAE035]/20 text-[#FAE035] flex items-center justify-center font-bold text-xs">
                <UserIcon size={12} />
              </div>
              <span className="text-slate-300">Viewing as:</span>
              <span className="font-bold text-white uppercase">ADMIN</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#1C2128] border border-[#2D333B] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                <div className="px-4 py-2.5 border-b border-[#2D333B] bg-[#15181D]">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Switch Workspace</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className="w-full text-left px-4 py-3 text-xs flex items-center justify-between hover:bg-[#171B20] transition text-white border-l-2 border-[#FAE035]"
                >
                  <div>
                    <p className="font-semibold text-white">Admin Panel</p>
                    <p className="text-[11px] text-[#FAE035]">Platform Admin</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#FAE035]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('coach')}
                  className="w-full text-left px-4 py-3 text-xs flex items-center justify-between hover:bg-[#171B20] transition text-slate-300 border-l-2 border-transparent"
                >
                  <div>
                    <p className="font-semibold text-slate-200">Coach Portal</p>
                    <p className="text-[11px] text-slate-400">{userSchoolName || 'Launch Coach Workspace'}</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg bg-[#171B20] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#2D333B] transition duration-200 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
