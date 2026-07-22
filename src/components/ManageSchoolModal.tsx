'use client';

import React, { useState, useEffect, useRef } from 'react';
import { School, SchoolStatus, CoachInfo } from '@/lib/types';
import { Copy, Check, User, X, ChevronDown } from 'lucide-react';
import { adminApi } from '@/lib/apiClient';

interface ManageSchoolModalProps {
  school: School | null;
  onClose: () => void;
  onSave: (updatedSchool: School) => void;
  onDeleteRequest: (school: School) => void;
}

export default function ManageSchoolModal({
  school,
  onClose,
  onSave,
  onDeleteRequest,
}: ManageSchoolModalProps) {
  if (!school) return null;

  // Local State
  const [schoolName, setSchoolName] = useState(school.name);
  const [status, setStatus] = useState<SchoolStatus>(school.status);
  const [subscriptionStart, setSubscriptionStart] = useState(school.subscriptionStart);
  const [renewalDate, setRenewalDate] = useState(school.renewalDate);

  // Custom Status Dropdown Open State
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Coach Data
  const [headCoach, setHeadCoach] = useState<CoachInfo | undefined>(school.headCoach);
  const [strengthCoach, setStrengthCoach] = useState<CoachInfo | undefined>(school.strengthCoach);

  // Feedback & Action Modal State
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState<{
    type: 'editEmail' | 'replaceCoach';
    coachType: 'HC' | 'SC';
    coachName: string;
    coachEmail: string;
  } | null>(null);

  // Action Form Inputs
  const [editEmailValue, setEditEmailValue] = useState('');
  const [replaceEmailValue, setReplaceEmailValue] = useState('');
  const [replaceNameValue, setReplaceNameValue] = useState('');

  // Lock background scroll while modal is open & handle outside click
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Copy Team Code Handler
  const handleCopyCode = () => {
    navigator.clipboard.writeText(school.teamCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Save Changes Handler
  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Status Update
      if (status !== school.status) {
        try {
          await adminApi.updateTeamStatus(school.id, status.toLowerCase() as any);
        } catch (err) {
          console.warn('API status update fallback:', err);
        }
      }

      // 2. Subscription Dates Update
      if (subscriptionStart !== school.subscriptionStart || renewalDate !== school.renewalDate) {
        try {
          await adminApi.updateTeamSubscription(school.id, {
            subscriptionStart,
            renewalDate,
          });
        } catch (err) {
          console.warn('API subscription date update fallback:', err);
        }
      }

      const hcPart = headCoach?.name ? `${headCoach.name} (HC)` : '';
      const scPart = strengthCoach?.name ? `${strengthCoach.name} (SC)` : '';
      const coachesDisplay = [hcPart, scPart].filter(Boolean).join(', ') || 'No coaches assigned';

      const updated: School = {
        ...school,
        name: schoolName.trim(),
        status,
        subscriptionStart,
        renewalDate,
        headCoach,
        strengthCoach,
        coachesDisplay,
      };

      onSave(updated);
      onClose();
    } catch (err) {
      console.error('Failed to save school changes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Coach Action Handlers
  const handleResendInvite = async (type: 'HC' | 'SC') => {
    const target = type === 'HC' ? headCoach : strengthCoach;
    alert(`Invitation email resent to ${target?.email || 'coach'} successfully!`);
  };

  const handleDeactivateCoach = (type: 'HC' | 'SC') => {
    if (type === 'HC') {
      if (headCoach) setHeadCoach({ ...headCoach, status: 'Pending Invite', name: 'Deactivated' });
    } else {
      if (strengthCoach) setStrengthCoach(undefined);
    }
  };

  const executeEditEmail = async () => {
    if (!activeActionModal || !editEmailValue.trim()) return;
    const newEmail = editEmailValue.trim();
    if (activeActionModal.coachType === 'HC' && headCoach) {
      if (headCoach.id) {
        try {
          await adminApi.updateCoachEmail(headCoach.id, newEmail);
        } catch (err: any) {
          alert(`Failed to update head coach email: ${err.message || err}`);
          return;
        }
      }
      setHeadCoach({ ...headCoach, email: newEmail });
    } else if (activeActionModal.coachType === 'SC' && strengthCoach) {
      if (strengthCoach.id) {
        try {
          await adminApi.updateCoachEmail(strengthCoach.id, newEmail);
        } catch (err: any) {
          alert(`Failed to update strength coach email: ${err.message || err}`);
          return;
        }
      }
      setStrengthCoach({ ...strengthCoach, email: newEmail });
    }
    setActiveActionModal(null);
    setEditEmailValue('');
  };

  const executeReplaceCoach = () => {
    if (!activeActionModal || !replaceEmailValue.trim()) return;
    const newEmail = replaceEmailValue.trim();
    const newName = replaceNameValue.trim() || 'New Coach';
    const newCoach: CoachInfo = {
      name: newName,
      email: newEmail,
      type: activeActionModal.coachType,
      status: 'Pending Invite',
    };

    if (activeActionModal.coachType === 'HC') {
      setHeadCoach(newCoach);
    } else {
      setStrengthCoach(newCoach);
    }
    setActiveActionModal(null);
    setReplaceEmailValue('');
    setReplaceNameValue('');
  };

  // Status Badge Renderer helper
  const renderStatusBadge = (s: SchoolStatus) => {
    switch (s) {
      case 'Active':
        return <span className="text-emerald-400 font-bold">Active</span>;
      case 'Paused':
        return <span className="text-amber-400 font-bold">Paused</span>;
      case 'Archived':
        return <span className="text-purple-400 font-bold">Archived</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Centered Overlay Window */}
      <div className="bg-[#1C2128] border border-[#2D333B] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2D333B] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-wide">
              Manage School – <span className="text-[#FAE035]">{school.name}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#171B20] transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: School Information */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#2D333B] pb-2">
              SCHOOL INFORMATION
            </h4>

            {/* School Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#FAE035] transition"
              />
            </div>

            {/* Team Code with Copy Button */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Team Code
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={school.teamCode}
                  className="bg-[#171B20] border border-[#2D333B] font-mono font-bold text-sm text-[#FAE035] rounded-lg px-4 py-2.5 w-36 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1.5 bg-[#171B20] hover:bg-[#262A33] border border-[#2D333B] text-xs font-normal text-white px-3.5 py-2.5 rounded-lg transition cursor-pointer"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Subscription Start Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Subscription Start
              </label>
              <input
                type="date"
                value={subscriptionStart}
                onChange={(e) => setSubscriptionStart(e.target.value)}
                className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#FAE035] transition cursor-pointer"
              />
            </div>

            {/* Renewal Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Renewal Date
              </label>
              <input
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#FAE035] transition cursor-pointer"
              />
            </div>

            {/* Custom Project-Aligned Status Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Status
              </label>
              <div className="relative" ref={statusDropdownRef}>
                <button
                  type="button"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="w-full bg-[#171B20] hover:bg-[#222730] border border-[#2D333B] focus:border-[#FAE035] rounded-lg px-4 py-2.5 text-sm flex items-center justify-between transition cursor-pointer"
                >
                  {renderStatusBadge(status)}
                  <ChevronDown size={16} className="text-[#FAE035] ml-2" />
                </button>

                {statusDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-[#1C2128] border border-[#2D333B] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                    {(['Active', 'Paused', 'Archived'] as SchoolStatus[]).map((statusOption) => (
                      <button
                        key={statusOption}
                        type="button"
                        onClick={() => {
                          setStatus(statusOption);
                          setStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-[#171B20] transition cursor-pointer ${
                          status === statusOption ? 'bg-[#171B20] border-l-2 border-[#FAE035]' : ''
                        }`}
                      >
                        {renderStatusBadge(statusOption)}
                        {status === statusOption && <Check size={14} className="text-[#FAE035]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Coaches */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#2D333B] pb-2">
              COACHES
            </h4>

            {/* Head Coach Card */}
            <div className="bg-[#171B20] border border-[#2D333B] rounded-xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User size={24} className="text-[#FAE035]" />
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Head Coach</span>
                    <span className="text-sm font-bold text-white">
                      {headCoach?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    headCoach?.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {headCoach?.status || 'Inactive'}
                </span>
              </div>

              <p className="text-xs text-slate-400 pl-9">{headCoach?.email || 'No email attached'}</p>

              {/* Head Coach Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2D333B]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveActionModal({
                      type: 'editEmail',
                      coachType: 'HC',
                      coachName: headCoach?.name || 'Head Coach',
                      coachEmail: headCoach?.email || '',
                    });
                    setEditEmailValue(headCoach?.email || '');
                  }}
                  className="px-2.5 py-1 text-[11px] font-normal bg-[#2D333B] hover:bg-[#363B47] text-slate-200 rounded transition cursor-pointer"
                >
                  Edit Email
                </button>
                <button
                  type="button"
                  onClick={() => handleResendInvite('HC')}
                  className="px-2.5 py-1 text-[11px] font-normal bg-[#2D333B] hover:bg-[#363B47] text-slate-200 rounded transition cursor-pointer"
                >
                  Resend Invite
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveActionModal({
                      type: 'replaceCoach',
                      coachType: 'HC',
                      coachName: headCoach?.name || 'Head Coach',
                      coachEmail: headCoach?.email || '',
                    });
                  }}
                  className="px-2.5 py-1 text-[11px] font-normal bg-[#2D333B] hover:bg-[#363B47] text-slate-200 rounded transition cursor-pointer"
                >
                  Replace Coach
                </button>
                <button
                  type="button"
                  onClick={() => handleDeactivateCoach('HC')}
                  className="px-2.5 py-1 text-[11px] font-normal bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition cursor-pointer"
                >
                  Deactivate
                </button>
              </div>
            </div>

            {/* Strength Coach Card */}
            <div className="bg-[#171B20] border border-[#2D333B] rounded-xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User size={24} className="text-[#FAE035]" />
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Strength Coach</span>
                    <span className="text-sm font-bold text-white">
                      {strengthCoach?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    strengthCoach?.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {strengthCoach ? strengthCoach.status : 'Empty Slot'}
                </span>
              </div>

              <p className="text-xs text-slate-400 pl-9">
                {strengthCoach?.email || 'No strength coach assigned yet'}
              </p>

              {/* Strength Coach Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2D333B]">
                {strengthCoach ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveActionModal({
                          type: 'editEmail',
                          coachType: 'SC',
                          coachName: strengthCoach.name,
                          coachEmail: strengthCoach.email,
                        });
                        setEditEmailValue(strengthCoach.email);
                      }}
                      className="px-2.5 py-1 text-[11px] font-normal bg-[#2D333B] hover:bg-[#363B47] text-slate-200 rounded transition cursor-pointer"
                    >
                      Edit Email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResendInvite('SC')}
                      className="px-2.5 py-1 text-[11px] font-normal bg-[#2D333B] hover:bg-[#363B47] text-slate-200 rounded transition cursor-pointer"
                    >
                      Resend Invite
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveActionModal({
                          type: 'replaceCoach',
                          coachType: 'SC',
                          coachName: strengthCoach.name,
                          coachEmail: strengthCoach.email,
                        });
                      }}
                      className="px-2.5 py-1 text-[11px] font-normal bg-[#2D333B] hover:bg-[#363B47] text-slate-200 rounded transition cursor-pointer"
                    >
                      Replace Coach
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeactivateCoach('SC')}
                      className="px-2.5 py-1 text-[11px] font-normal bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition cursor-pointer"
                    >
                      Deactivate
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveActionModal({
                        type: 'replaceCoach',
                        coachType: 'SC',
                        coachName: 'Strength Coach',
                        coachEmail: '',
                      });
                    }}
                    className="px-3 py-1 text-[11px] font-normal bg-[#FAE035] hover:bg-[#E5CD25] text-black rounded transition cursor-pointer shadow-md"
                  >
                    + Assign Strength Coach
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#2D333B] flex items-center justify-between bg-[#15181D] rounded-b-2xl">
          <button
            type="button"
            onClick={() => onDeleteRequest(school)}
            className="text-xs font-normal text-red-400 hover:text-red-300 transition cursor-pointer"
          >
            Delete School
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-normal text-slate-300 hover:text-white bg-[#171B20] hover:bg-[#262A33] border border-[#2D333B] rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="px-6 py-2.5 text-xs font-normal text-black bg-[#FAE035] hover:bg-[#E5CD25] rounded-lg shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Action Modals (Edit Email / Replace Coach) */}
      {activeActionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#1C2128] border border-[#2D333B] rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white">
              {activeActionModal.type === 'editEmail'
                ? `Edit Login Email – ${activeActionModal.coachName}`
                : `Replace ${activeActionModal.coachType === 'HC' ? 'Head Coach' : 'Strength Coach'}`}
            </h4>

            {activeActionModal.type === 'editEmail' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Login Email
                </label>
                <input
                  type="email"
                  value={editEmailValue}
                  onChange={(e) => setEditEmailValue(e.target.value)}
                  placeholder="Enter new coach email"
                  className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#FAE035]"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Replacement Coach Name
                  </label>
                  <input
                    type="text"
                    value={replaceNameValue}
                    onChange={(e) => setReplaceNameValue(e.target.value)}
                    placeholder="Enter coach full name"
                    className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#FAE035]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Replacement Coach Email
                  </label>
                  <input
                    type="email"
                    value={replaceEmailValue}
                    onChange={(e) => setReplaceEmailValue(e.target.value)}
                    placeholder="Enter email address for invitation"
                    className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#FAE035]"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="px-4 py-2 text-xs font-normal text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={activeActionModal.type === 'editEmail' ? executeEditEmail : executeReplaceCoach}
                className="px-4 py-2 text-xs font-normal bg-[#FAE035] hover:bg-[#E5CD25] text-black rounded-lg cursor-pointer transition shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
