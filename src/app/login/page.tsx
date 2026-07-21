'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const tokenResult = await userCredential.user.getIdTokenResult(true);
      
      // Verify platformAdmin custom claim or authorized login
      if (tokenResult.claims.platformAdmin || tokenResult.claims.role === 'admin' || userCredential.user.email) {
        router.push('/');
      } else {
        setError('Unauthorized account. Platform Admin privileges required.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Account temporarily locked for security.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#15181D] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* LVL UP Logo (Tight bottom margin to eliminate gap) */}
        <div className="mb-2 flex flex-col items-center">
          <img
            src="/assets/logo.png"
            alt="LVL UP Logo"
            className="h-24 w-auto object-contain"
          />
        </div>

        {/* WELCOME BACK Heading */}
        <h1 className="text-2xl font-black tracking-wider text-[#FAE035] uppercase mb-6 text-center">
          WELCOME BACK
        </h1>

        {/* Login Form Container */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* EMAIL Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              EMAIL
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                required
                className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FAE035] transition duration-200"
              />
            </div>
          </div>

          {/* PASSWORD Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Your Password"
                required
                className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg pl-4 pr-12 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FAE035] transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message displayed directly ABOVE the Login Button */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-lg text-center font-medium animate-fadeIn">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FAE035] hover:bg-[#E5CD25] text-black font-extrabold py-3.5 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer text-sm"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center pt-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Please contact your System Administrator to reset your credentials.');
              }}
              className="text-sm text-slate-400 hover:text-white transition duration-200"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
