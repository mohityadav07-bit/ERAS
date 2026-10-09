import React from 'react';
import {
  DoorOpen,
  ClockAlert,
  Coins,
  GraduationCap,
  ArrowUpRight,
} from 'lucide-react';
import { Booking, DepartmentBudget, Resource } from '../../types';

interface KpiCardsProps {
  resources: Resource[];
  bookings: Booking[];
  budgets: DepartmentBudget[];
  onFilterAvailableRooms?: () => void;
  onFilterPendingRequests?: () => void;
  onNavigateBudget?: () => void;
  onNavigateTimetable?: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  resources,
  bookings,
  budgets,
  onFilterAvailableRooms,
  onFilterPendingRequests,
  onNavigateBudget,
  onNavigateTimetable,
}) => {
  // 1. Total Classrooms / Labs Free
  const educationalRooms = resources.filter(
    (r) => r.category === 'Classroom' || r.category === 'Lab'
  );
  const availableRooms = educationalRooms.filter((r) => r.status === 'Available');
  const availableClassroomsCount = educationalRooms.filter(
    (r) => r.category === 'Classroom' && r.status === 'Available'
  ).length;
  const availableLabsCount = educationalRooms.filter(
    (r) => r.category === 'Lab' && r.status === 'Available'
  ).length;

  // 2. Pending Requests
  const pendingBookings = bookings.filter((b) => b.status === 'Pending');
  const highPriorityPending = pendingBookings.filter(
    (b) => b.priority === 'High' || b.priority === 'Urgent'
  ).length;

  // 3. Budget Utilized
  const totalAllocated = budgets.reduce((acc, b) => acc + b.totalAllocated, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const budgetUtilizationPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const remainingBudget = totalAllocated - totalSpent;

  // 4. Active Teachers
  const activeTeachersCount = 18;
  const inSessionLectures = resources.filter((r) => r.status === 'Occupied').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Total Classrooms Free */}
      <div
        onClick={onFilterAvailableRooms}
        className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 hover:border-yellow-400/50 transition-all cursor-pointer group shadow-sm hover:shadow-yellow-500/5"
      >
        <div className="flex items-center justify-between text-neutral-400 mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">Total Rooms Free</span>
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <DoorOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white group-hover:text-yellow-400 transition-colors">
            {availableRooms.length}
          </span>
          <span className="text-xs text-neutral-500">
            of {educationalRooms.length} operational
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span>{availableClassroomsCount} Halls</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span>{availableLabsCount} Labs</span>
          </div>
          <span className="text-yellow-400 font-semibold flex items-center gap-0.5">
            Live Grid
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* KPI 2: Pending Requests */}
      <div
        onClick={onFilterPendingRequests}
        className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 hover:border-yellow-400/50 transition-all cursor-pointer group shadow-sm hover:shadow-yellow-500/5"
      >
        <div className="flex items-center justify-between text-neutral-400 mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">Pending Requests</span>
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ClockAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white group-hover:text-yellow-400 transition-colors">
            {pendingBookings.length}
          </span>
          {highPriorityPending > 0 ? (
            <span className="text-xs font-bold text-yellow-400">
              {highPriorityPending} High/Urgent
            </span>
          ) : (
            <span className="text-xs text-neutral-500">Awaiting review</span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Requires sign-off</span>
          <span className="text-yellow-400 font-semibold flex items-center gap-0.5">
            Review
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* KPI 3: Budget Utilized */}
      <div
        onClick={onNavigateBudget}
        className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 hover:border-yellow-400/50 transition-all cursor-pointer group shadow-sm hover:shadow-yellow-500/5"
      >
        <div className="flex items-center justify-between text-neutral-400 mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">Budget Utilized</span>
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white group-hover:text-yellow-400 transition-colors">
            {budgetUtilizationPct}%
          </span>
          <span className="text-xs text-neutral-500">
            ${(totalSpent / 1000).toFixed(0)}k / ${(totalAllocated / 1000).toFixed(0)}k
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-800">
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-500 shadow-xs shadow-yellow-400/50"
              style={{ width: `${Math.min(100, budgetUtilizationPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400 mt-1.5">
            <span>Left: ${(remainingBudget / 1000).toFixed(1)}k</span>
            <span className="text-yellow-400/80">FY 2026-27</span>
          </div>
        </div>
      </div>

      {/* KPI 4: Active Teachers */}
      <div
        onClick={onNavigateTimetable}
        className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 hover:border-yellow-400/50 transition-all cursor-pointer group shadow-sm hover:shadow-yellow-500/5"
      >
        <div className="flex items-center justify-between text-neutral-400 mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">Active Faculty</span>
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white group-hover:text-yellow-400 transition-colors">
            {activeTeachersCount}
          </span>
          <span className="text-xs text-neutral-500">
            Across 5 departments
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>{inSessionLectures} Lectures ongoing</span>
          <span className="text-yellow-400 font-semibold flex items-center gap-0.5">
            Timetable
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
