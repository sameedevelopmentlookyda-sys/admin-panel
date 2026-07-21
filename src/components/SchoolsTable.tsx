'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { School, SchoolStatus, SortDirection, SortField } from '@/lib/types';
import { ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal, PauseCircle, PlayCircle, Search, SlidersHorizontal, Trash2, Archive, Check } from 'lucide-react';

interface SchoolsTableProps {
  schools: School[];
  onManageSchool: (school: School) => void;
  onPauseSchool: (school: School) => void;
  onReactivateSchool: (school: School) => void;
  onArchiveSchool: (school: School) => void;
  onDeleteSchool: (school: School) => void;
}

export default function SchoolsTable({
  schools,
  onManageSchool,
  onPauseSchool,
  onReactivateSchool,
  onArchiveSchool,
  onDeleteSchool,
}: SchoolsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<SchoolStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter Dropdown Open State
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Active Three-Dot Menu Row ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Column Header Sort Toggle (Only sorts the clicked column)
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort Schools
  const filteredAndSortedSchools = useMemo(() => {
    let result = [...schools];

    // 1. Status Filter
    if (statusFilter !== 'All') {
      result = result.filter((school) => school.status === statusFilter);
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (school) =>
          school.name.toLowerCase().includes(q) ||
          school.teamCode.toLowerCase().includes(q) ||
          (school.coachesDisplay && school.coachesDisplay.toLowerCase().includes(q)) ||
          (school.headCoach?.name && school.headCoach.name.toLowerCase().includes(q)) ||
          (school.strengthCoach?.name && school.strengthCoach.name.toLowerCase().includes(q))
      );
    }

    // 3. Sort Logic
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'subscriptionStart') {
        comparison = new Date(a.subscriptionStart).getTime() - new Date(b.subscriptionStart).getTime();
      } else if (sortField === 'renewalDate') {
        comparison = new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [schools, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedSchools.length / itemsPerPage));
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSchools.slice(start, start + itemsPerPage);
  }, [filteredAndSortedSchools, currentPage]);

  // Format Dates cleanly (e.g. Jun 15, 2025)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: SchoolStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        );
      case 'Paused':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Paused
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1C2128] border border-[#2D333B] rounded-xl shadow-xl overflow-hidden">
      {/* Table Top Controls Bar: Search & Filter */}
      <div className="p-6 border-b border-[#2D333B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white tracking-wide">Your Schools</h2>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Search Schools Field (Lighter background #222730 for clarity) */}
          <div className="relative flex-1 md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search schools..."
              className="w-full bg-[#222730] border border-[#333944] text-xs text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#FAE035] transition"
            />
          </div>

          {/* Filter Dropdown Toggle Button (Lighter background #222730) */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className={`flex items-center space-x-1.5 bg-[#222730] hover:bg-[#2C323E] border ${
                statusFilter !== 'All' ? 'border-[#FAE035] text-[#FAE035]' : 'border-[#333944] text-slate-300'
              } text-xs font-semibold px-3.5 py-2.5 rounded-lg transition cursor-pointer`}
            >
              <SlidersHorizontal size={14} />
              <span>Filter{statusFilter !== 'All' ? `: ${statusFilter}` : ''}</span>
            </button>

            {/* Filter Options Menu */}
            {filterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1C2128] border border-[#333944] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                <div className="px-3.5 py-2 border-b border-[#2D333B] bg-[#15181D]">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Filter by Status</p>
                </div>
                {(['All', 'Active', 'Paused', 'Archived'] as const).map((statusOpt) => (
                  <button
                    key={statusOpt}
                    type="button"
                    onClick={() => {
                      setStatusFilter(statusOpt);
                      setCurrentPage(1);
                      setFilterDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#222730] transition text-slate-200 cursor-pointer"
                  >
                    <span>{statusOpt === 'All' ? 'All Statuses' : statusOpt}</span>
                    {statusFilter === statusOpt && <Check size={14} className="text-[#FAE035]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#15181D] border-b border-[#2D333B] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              {/* SCHOOL Column (Clicking ONLY sorts School name) */}
              <th
                scope="col"
                onClick={() => handleSort('name')}
                className="px-6 py-4 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center space-x-1">
                  <span>SCHOOL</span>
                  <ArrowUpDown size={12} className={sortField === 'name' ? 'text-[#FAE035]' : ''} />
                </div>
              </th>

              <th scope="col" className="px-6 py-4">
                COACHES
              </th>

              {/* STATUS Column (Clicking ONLY sorts Status) */}
              <th
                scope="col"
                onClick={() => handleSort('status')}
                className="px-6 py-4 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center space-x-1">
                  <span>STATUS</span>
                  <ArrowUpDown size={12} className={sortField === 'status' ? 'text-[#FAE035]' : ''} />
                </div>
              </th>

              {/* SUBSCRIPTION START Column */}
              <th
                scope="col"
                onClick={() => handleSort('subscriptionStart')}
                className="px-6 py-4 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center space-x-1">
                  <span>SUBSCRIPTION START</span>
                  <ArrowUpDown size={12} className={sortField === 'subscriptionStart' ? 'text-[#FAE035]' : ''} />
                </div>
              </th>

              {/* RENEWAL DATE Column */}
              <th
                scope="col"
                onClick={() => handleSort('renewalDate')}
                className="px-6 py-4 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center space-x-1">
                  <span>RENEWAL DATE</span>
                  <ArrowUpDown size={12} className={sortField === 'renewalDate' ? 'text-[#FAE035]' : ''} />
                </div>
              </th>

              <th scope="col" className="px-6 py-4 text-right">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#2D333B]">
            {paginatedSchools.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                  No schools found matching your search and filter criteria.
                </td>
              </tr>
            ) : (
              paginatedSchools.map((school) => (
                <tr key={school.id} className="hover:bg-[#222730]/60 transition">
                  {/* SCHOOL Column (Bright White Text) */}
                  <td className="px-6 py-4 font-bold text-white text-sm">
                    {school.name}
                  </td>

                  {/* COACHES Column */}
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    {school.coachesDisplay || (
                      <>
                        {school.headCoach?.name ? `${school.headCoach.name} (HC)` : ''}
                        {school.headCoach?.name && school.strengthCoach?.name ? ', ' : ''}
                        {school.strengthCoach?.name ? `${school.strengthCoach.name} (SC)` : ''}
                      </>
                    )}
                  </td>

                  {/* STATUS Column */}
                  <td className="px-6 py-4">{renderStatusBadge(school.status)}</td>

                  {/* SUBSCRIPTION START Column */}
                  <td className="px-6 py-4 text-slate-400 font-medium">{formatDate(school.subscriptionStart)}</td>

                  {/* RENEWAL DATE Column */}
                  <td className="px-6 py-4 text-slate-400 font-medium">{formatDate(school.renewalDate)}</td>

                  {/* ACTIONS Column */}
                  <td className="px-6 py-4 text-right relative">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Manage Button */}
                      <button
                        type="button"
                        onClick={() => onManageSchool(school)}
                        className="bg-[#222730] hover:bg-[#2C323E] border border-[#333944] text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition cursor-pointer"
                      >
                        Manage
                      </button>

                      {/* Three-Dot Menu Toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === school.id ? null : school.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#222730] transition cursor-pointer"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {/* Three-Dot Contextual Dropdown */}
                        {activeMenuId === school.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 mt-2 w-48 bg-[#1C2128] border border-[#333944] rounded-xl shadow-2xl z-50 overflow-hidden py-1 text-left"
                          >
                            {/* Actions based on School Status */}
                            {school.status === 'Active' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onPauseSchool(school);
                                  }}
                                  className="w-full px-4 py-2.5 text-xs text-amber-400 hover:bg-[#222730] flex items-center space-x-2.5 transition cursor-pointer"
                                >
                                  <PauseCircle size={15} />
                                  <span>Pause School</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onArchiveSchool(school);
                                  }}
                                  className="w-full px-4 py-2.5 text-xs text-purple-400 hover:bg-[#222730] flex items-center space-x-2.5 transition cursor-pointer"
                                >
                                  <Archive size={15} />
                                  <span>Archive School</span>
                                </button>
                              </>
                            )}

                            {school.status === 'Paused' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onReactivateSchool(school);
                                  }}
                                  className="w-full px-4 py-2.5 text-xs text-emerald-400 hover:bg-[#222730] flex items-center space-x-2.5 transition cursor-pointer"
                                >
                                  <PlayCircle size={15} />
                                  <span>Reactivate School</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onArchiveSchool(school);
                                  }}
                                  className="w-full px-4 py-2.5 text-xs text-purple-400 hover:bg-[#222730] flex items-center space-x-2.5 transition cursor-pointer"
                                >
                                  <Archive size={15} />
                                  <span>Archive School</span>
                                </button>
                              </>
                            )}

                            {school.status === 'Archived' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onReactivateSchool(school);
                                }}
                                className="w-full px-4 py-2.5 text-xs text-emerald-400 hover:bg-[#222730] flex items-center space-x-2.5 transition cursor-pointer"
                              >
                                <PlayCircle size={15} />
                                <span>Reactivate School</span>
                              </button>
                            )}

                            {/* Delete Option always present at bottom */}
                            <div className="border-t border-[#2D333B] my-1" />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteSchool(school);
                              }}
                              className="w-full px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center space-x-2.5 transition cursor-pointer"
                            >
                              <Trash2 size={15} />
                              <span>Delete School</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#2D333B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          Showing <span className="font-semibold text-white">{filteredAndSortedSchools.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
          <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, filteredAndSortedSchools.length)}</span> of{' '}
          <span className="font-semibold text-white">{filteredAndSortedSchools.length}</span> schools
        </div>

        {/* Page Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg bg-[#222730] hover:bg-[#2C323E] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((page, index, array) => {
              const prevPage = array[index - 1];
              const showEllipsis = prevPage && page - prevPage > 1;

              return (
                <React.Fragment key={page}>
                  {showEllipsis && <span className="px-1 text-slate-600">...</span>}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs transition cursor-pointer ${
                      currentPage === page
                        ? 'bg-[#FAE035] text-black shadow-md'
                        : 'bg-[#222730] text-slate-300 hover:bg-[#2C323E]'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg bg-[#222730] hover:bg-[#2C323E] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
