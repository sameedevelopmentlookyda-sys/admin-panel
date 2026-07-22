'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import RadialSpinner from '@/components/RadialSpinner';

function RootRedirectContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#15181D] flex flex-col items-center justify-center p-4 text-white">
      <RadialSpinner className="w-10 h-10 mb-4" />
      <p className="text-sm font-semibold tracking-wide text-slate-300">
        Directing to workspace...
      </p>
    </div>
  );
}

export default function RootRedirectPage() {
  return (
    <AuthProvider>
      <RootRedirectContent />
    </AuthProvider>
  );
}
