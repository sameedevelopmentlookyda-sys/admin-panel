'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import AddSchoolForm from '@/components/AddSchoolForm';
import SchoolsTable from '@/components/SchoolsTable';
import ManageSchoolModal from '@/components/ManageSchoolModal';
import {
  StatusConfirmationModal,
  DeleteConfirmationModal,
  SuccessToastModal,
} from '@/components/ConfirmationModals';
import { School, SchoolStatus } from '@/lib/types';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import RadialSpinner from '@/components/RadialSpinner';

function AdminDashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [schools, setSchools] = useState<School[]>([]);
  const [loadingBackend, setLoadingBackend] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const addSchoolFormRef = useRef<HTMLDivElement>(null);

  // Modal States
  const [selectedManageSchool, setSelectedManageSchool] = useState<School | null>(null);
  const [statusModalState, setStatusModalState] = useState<{
    school: School | null;
    targetStatus: SchoolStatus | null;
  }>({ school: null, targetStatus: null });
  const [deleteModalSchool, setDeleteModalSchool] = useState<School | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auth Guard: Redirect unauthenticated visitors to /login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load Real Schools from Backend Cloud Functions / Firestore
  useEffect(() => {
    async function loadRealTeams() {
      if (!user) return;
      setLoadingBackend(true);
      setBackendError(null);

      try {
        const response = await adminApi.listTeams();
        console.log('Live backend response from /admin/teams:', response);

        if (response && Array.isArray(response.teams)) {
          const mappedSchools: School[] = response.teams.map((t: any) => {
            const rawStatus = (t.status || '').toLowerCase();
            let statusBadge: SchoolStatus = 'Active';
            if (rawStatus === 'paused') statusBadge = 'Paused';
            if (rawStatus === 'archived') statusBadge = 'Archived';

            return {
              id: t.teamId || t.id,
              name: t.name || 'Unnamed School',
              teamCode: t.teamCode || 'N/A',
              status: statusBadge,
              subscriptionStart: t.createdAt
                ? new Date(t.createdAt._seconds ? t.createdAt._seconds * 1000 : t.createdAt).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              renewalDate: t.renewalDate
                ? new Date(t.renewalDate._seconds ? t.renewalDate._seconds * 1000 : t.renewalDate).toISOString().split('T')[0]
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              headCoach: t.headCoach
                ? {
                    id: t.headCoach.uid || t.headCoach.id,
                    name: t.headCoach.name || 'Head Coach',
                    email: t.headCoach.email || '',
                    type: 'HC',
                    status: t.headCoach.status || 'Active',
                  }
                : undefined,
              strengthCoach: t.strengthCoach
                ? {
                    id: t.strengthCoach.uid || t.strengthCoach.id,
                    name: t.strengthCoach.name || 'Strength Coach',
                    email: t.strengthCoach.email || '',
                    type: 'SC',
                    status: t.strengthCoach.status || 'Active',
                  }
                : undefined,
              coachesDisplay:
                t.coachesDisplay || (t.headCoach ? `${t.headCoach.name || 'Head Coach'} (HC)` : 'No coaches assigned'),
            };
          });
          setSchools(mappedSchools);
        }
      } catch (err: any) {
        console.error('Error fetching live teams from Firestore:', err);
        setBackendError(err.message || 'Unable to connect to live backend API.');
      } finally {
        setLoadingBackend(false);
      }
    }

    if (user) {
      loadRealTeams();
    } else {
      setLoadingBackend(false);
    }
  }, [user]);

  // Scroll & Focus Add New School Form
  const handleAddSchoolClick = () => {
    if (addSchoolFormRef.current) {
      addSchoolFormRef.current.scrollIntoView({ behavior: 'smooth' });
      const firstInput = addSchoolFormRef.current.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  };

  // Handle New School Created
  const handleSchoolCreated = (newSchool: School) => {
    setSchools((prev) => [newSchool, ...prev]);
    setSuccessMessage(`School "${newSchool.name}" successfully created & invites sent!`);
  };

  // Handle Manage School Save
  const handleSaveManagedSchool = (updatedSchool: School) => {
    setSchools((prev) => prev.map((s) => (s.id === updatedSchool.id ? updatedSchool : s)));
    setSuccessMessage(`School "${updatedSchool.name}" details updated.`);
  };

  // Handle Status Confirmation Trigger
  const handleConfirmStatusChange = (school: School, newStatus: SchoolStatus) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === school.id ? { ...s, status: newStatus } : s))
    );
    setStatusModalState({ school: null, targetStatus: null });
    setSuccessMessage(`School "${school.name}" has been ${newStatus.toLowerCase()}.`);
  };

  // Handle Permanent Delete Trigger
  const handleConfirmDelete = async (school: School) => {
    try {
      await adminApi.deleteTeam(school.id);
      setSchools((prev) => prev.filter((s) => s.id !== school.id));
      setDeleteModalSchool(null);
      setSelectedManageSchool(null);
      setSuccessMessage(`${school.name} has been permanently deleted.`);
    } catch (err: any) {
      console.error('Failed to delete school:', err);
      alert(`Failed to delete school: ${err.message || err}`);
    }
  };

  // If loading or unauthenticated, show loader (prevents flash of dashboard)
  if (authLoading || loadingBackend || !user) {
    return (
      <div className="min-h-screen bg-[#15181D] flex flex-col items-center justify-center p-4 text-white">
        <RadialSpinner className="w-10 h-10 mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          {authLoading ? 'Verifying authentication...' : !user ? 'Redirecting to login...' : 'Loading Admin Portal...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#15181D] text-slate-100 flex flex-col font-sans pb-16">
      {/* Top Header */}
      <Header onAddSchoolClick={handleAddSchoolClick} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 pt-8 flex-1">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            School Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Add new schools and manage coach access.
          </p>
        </div>

        {backendError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl">
            {backendError}
          </div>
        )}

        {/* 1. Add New School Top Form (Full Width) */}
        <AddSchoolForm ref={addSchoolFormRef} onSchoolCreated={handleSchoolCreated} />

        {/* 2. Your Schools Table */}
        <SchoolsTable
          schools={schools}
          onManageSchool={(school) => setSelectedManageSchool(school)}
          onPauseSchool={(school) =>
            setStatusModalState({ school, targetStatus: 'Paused' })
          }
          onReactivateSchool={(school) =>
            setStatusModalState({ school, targetStatus: 'Active' })
          }
          onArchiveSchool={(school) =>
            setStatusModalState({ school, targetStatus: 'Archived' })
          }
          onDeleteSchool={(school) => setDeleteModalSchool(school)}
        />
      </main>

      {/* OVERLAY MODALS */}

      {/* Manage School Modal */}
      {selectedManageSchool && (
        <ManageSchoolModal
          school={selectedManageSchool}
          onClose={() => setSelectedManageSchool(null)}
          onSave={handleSaveManagedSchool}
          onDeleteRequest={(school) => setDeleteModalSchool(school)}
        />
      )}

      {/* Status Confirmation Modal (Pause / Reactivate / Archive) */}
      {statusModalState.school && statusModalState.targetStatus && (
        <StatusConfirmationModal
          school={statusModalState.school}
          targetStatus={statusModalState.targetStatus}
          onClose={() => setStatusModalState({ school: null, targetStatus: null })}
          onConfirmStatusChange={handleConfirmStatusChange}
        />
      )}

      {/* High Security Delete Confirmation Modal */}
      {deleteModalSchool && (
        <DeleteConfirmationModal
          school={deleteModalSchool}
          onClose={() => setDeleteModalSchool(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}

      {/* Success Toast / Notification */}
      {successMessage && (
        <SuccessToastModal
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthProvider>
      <AdminDashboardContent />
    </AuthProvider>
  );
}
