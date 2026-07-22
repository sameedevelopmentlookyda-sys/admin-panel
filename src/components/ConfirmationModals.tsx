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
      <div className="bg-[#1C2128] border border-[#2D333B] rounded-2xl p-6 w-full max-w-md space-y-6 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#2D333B]">
          <h3 className="text-lg font-bold text-white">Delete School</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Warning Icon & Description (Step 1 matching design) */}
        <div className="flex flex-col items-center text-center space-y-3 my-4">
          <AlertTriangle size={48} className="text-[#EF4444] animate-pulse" />
          <p className="text-xs text-slate-400 font-medium">Are you sure you want to permanently delete</p>
          <h4 className="text-base font-extrabold text-white px-2 leading-snug">{school.name}?</h4>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            This action cannot be undone. All data will be permanently deleted including athletes, tests, results, and settings.
          </p>
        </div>

        {/* Typed Security Input */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2D333B]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-[#2D333B] hover:bg-[#363B47] rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isConfirmed}
            onClick={() => onConfirmDelete(school)}
            className="px-5 py-2.5 text-xs font-bold bg-[#991B1B] hover:bg-[#DC2626] disabled:opacity-30 text-white rounded-lg shadow-md transition cursor-pointer disabled:cursor-not-allowed"
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

  // Render a cleaner visual state depending on if school was deleted or created
  const isDeleteSuccess = message.toLowerCase().includes('deleted');

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1C2128] border border-[#2D333B] rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
        {/* Top Right Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <div className="w-14 h-14 rounded-full border-[3.5px] border-emerald-500 flex items-center justify-center bg-emerald-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="4" stroke="#10B981" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-white tracking-wide">
            {isDeleteSuccess ? 'School Deleted' : 'Success'}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xs px-2">
            {message}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#FAE035] hover:bg-[#E5CD25] text-black font-extrabold text-xs py-2.5 rounded-lg shadow-md transition cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
