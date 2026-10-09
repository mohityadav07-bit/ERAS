import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarRange,
  DollarSign,
  Boxes,
  BarChart3,
  Code2,
  Building2,
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'bookings'
  | 'timetable'
  | 'budget'
  | 'inventory'
  | 'reports'
  | 'architecture';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  pendingRequestsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  pendingRequestsCount,
}) => {
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    description: string;
    allowedRoles?: UserRole[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'KPI metrics, room availability & queues',
    },
    {
      id: 'bookings',
      label: 'Resource Booking',
      icon: CalendarCheck,
      badge: pendingRequestsCount,
      description: 'Reservations, schedule grid & clash checks',
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: CalendarRange,
      description: 'Smart weekly matrix & CSP solver',
    },
    {
      id: 'budget',
      label: 'Budget Allocation',
      icon: DollarSign,
      description: 'Departmental spend & fiscal ledger',
      allowedRoles: ['Admin', 'HOD'],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      description: 'Lab gear, AV assets & licenses',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      description: 'Room utilization & peak heatmaps',
    },
    {
      id: 'architecture',
      label: 'Architecture & Specs',
      icon: Code2,
      description: 'ER Diagram, SQL Schema, REST APIs & Roadmap',
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-neutral-950 text-neutral-300 flex flex-col border-r border-neutral-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-neutral-800 bg-neutral-950/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-400 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-yellow-500/10">
            <Building2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>ERAS</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
                PRO
              </span>
            </div>
            <div className="text-xs text-neutral-400">Education Resource Allocation</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Core Modules
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const isRestricted = item.allowedRoles && !item.allowedRoles.includes(userRole);

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left group ${
                isActive
                  ? 'bg-yellow-400 text-neutral-950 font-bold shadow-sm shadow-yellow-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-neutral-950 stroke-[2.5]' : 'text-neutral-400 group-hover:text-yellow-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      isActive
                        ? 'bg-neutral-950 text-yellow-400'
                        : 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isRestricted && (
                  <span className={`text-[10px] font-mono uppercase ${isActive ? 'text-neutral-800' : 'text-neutral-600'}`}>
                    HOD/Admin
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Role Context Footer */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900/60">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-neutral-400">Active Role</span>
          <span className="text-yellow-400 font-bold">{userRole}</span>
        </div>
        <div className="text-[11px] text-neutral-400 leading-snug">
          {userRole === 'Admin' && 'Full platform controls, approvals & institutional budgets.'}
          {userRole === 'HOD' && 'Department resource booking, budget approvals & scheduling.'}
          {userRole === 'Faculty' && 'Lab/hall booking, course timetable viewing & asset requests.'}
          {userRole === 'Student' && 'Student club room requests & read-only timetable schedules.'}
        </div>
      </div>
    </aside>
  );
};
