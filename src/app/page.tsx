'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

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
      <Loader2 size={40} className="animate-spin text-[#FAE035] mb-4" />
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
