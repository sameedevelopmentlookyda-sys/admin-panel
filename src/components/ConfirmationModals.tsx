'use client';

import React, { useState } from 'react';
import { School, SchoolStatus } from '@/lib/types';
import { AlertTriangle, CheckCircle2, PauseCircle, PlayCircle, Archive, X } from 'lucide-react';

interface StatusModalProps {
  school: School | null;
  targetStatus: SchoolStatus | null;
  onClose: () => void;
  onConfirmStatusChange: (school: School, newStatus: SchoolStatus) => void;
}

export function StatusConfirmationModal({
  school,
  targetStatus,
  onClose,
  onConfirmStatusChange,
}: StatusModalProps) {
  if (!school || !targetStatus) return null;

  const getModalContent = () => {
    switch (targetStatus) {
      case 'Paused':
        return {
          title: `Pause School – ${school.name}`,
          icon: <PauseCircle size={32} className="text-amber-400" />,
          description:
            'Coaches and athletes will temporarily lose access to the platform. All team data, athlete scores, ratings, and testing history will remain safely preserved. You can reactivate this school at any time.',
          actionText: 'Pause School',
          actionBtnClass: 'bg-amber-500 hover:bg-amber-600 text-black font-extrabold',
        };
      case 'Active':
        return {
          title: `Reactivate School – ${school.name}`,
          icon: <PlayCircle size={32} className="text-emerald-400" />,
          description:
            'Full access will be immediately restored to the school’s active coaches and athletes. They will be able to log in, test, and view leaderboards normally.',
          actionText: 'Reactivate School',
          actionBtnClass: 'bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold',
        };
      case 'Archived':
        return {
          title: `Archive School – ${school.name}`,
          icon: <Archive size={32} className="text-purple-400" />,
          description:
            'The school will no longer have active access, and the subscription will be marked as inactive. All historical data will remain securely saved in case the school returns in the future.',
          actionText: 'Archive School',
          actionBtnClass: 'bg-purple-500 hover:bg-purple-600 text-white font-extrabold',
        };
      default:
        return null;
    }
  };

  const content = getModalContent();
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1C2128] border border-[#2D333B] rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {content.icon}
            <h3 className="text-lg font-bold text-white">{content.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-[#171B20] p-4 rounded-xl border border-[#2D333B]">
          {content.description}
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#171B20] rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirmStatusChange(school, targetStatus)}
            className={`px-5 py-2 text-xs rounded-lg shadow-md transition cursor-pointer ${content.actionBtnClass}`}
          >
            {content.actionText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  school: School | null;
  onClose: () => void;
  onConfirmDelete: (school: School) => void;
}

export function DeleteConfirmationModal({
  school,
  onClose,
  onConfirmDelete,
}: DeleteModalProps) {
  const [typedName, setTypedName] = useState('');
  if (!school) return null;

  const isConfirmed = typedName.trim() === school.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1C2128] border border-red-500/30 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete School</h3>
              <p className="text-xs text-red-400 font-semibold">{school.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-red-400">Warning: This action cannot be undone!</p>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Permanent deletion removes the school and all associated data, including:
          </p>
          <ul className="list-disc pl-4 text-[11px] text-slate-400 space-y-0.5">
            <li>Coach access & accounts</li>
            <li>Athlete profiles & rosters</li>
            <li>Testing sessions, raw results & ratings</li>
            <li>Road to 99 records & school settings</li>
          </ul>
        </div>

        {/* Typed Security Input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Type the school name to confirm:
          </label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder={school.name}
            className="w-full bg-[#171B20] border border-[#2D333B] text-xs text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#171B20] rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isConfirmed}
            onClick={() => onConfirmDelete(school)}
            className="px-5 py-2 text-xs font-extrabold bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white rounded-lg shadow-md transition cursor-pointer disabled:cursor-not-allowed"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

interface SuccessModalProps {
  message: string | null;
  onClose: () => void;
}

export function SuccessToastModal({ message, onClose }: SuccessModalProps) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1C2128] border border-emerald-500/30 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center space-y-4 shadow-2xl">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-base font-bold text-white">{message}</h3>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-[#FAE035] hover:bg-[#E5CD25] text-black font-extrabold text-xs py-2.5 rounded-lg shadow-md transition cursor-pointer"
        >
          OK
        </button>
      </div>
    </div>
  );
}
