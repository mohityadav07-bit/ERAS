import React from 'react';
import {
  Bell,
  Search,
  Plus,
  Shield,
  GraduationCap,
  Briefcase,
  UserCheck,
  Check,
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface TopBarProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  onRequestResource: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onRequestResource,
  onOpenNotifications,
  unreadNotificationsCount,
  searchQuery,
  onSearchChange,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return <Shield className="w-4 h-4 text-yellow-400" />;
      case 'HOD':
        return <Briefcase className="w-4 h-4 text-yellow-300" />;
      case 'Faculty':
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'Student':
        return <UserCheck className="w-4 h-4 text-yellow-200" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search classrooms, labs, teachers, or bookings (e.g., LT-101)..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:bg-neutral-900 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-yellow-400"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Request Resource Button (Vibrant Yellow) */}
          <button
            onClick={onRequestResource}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 rounded-lg transition-colors shadow-sm shadow-yellow-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Request Resource</span>
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-yellow-400/40 rounded-lg transition-colors"
              title="Switch user role for simulation"
            >
              {getRoleIcon(currentUser.role)}
              <span className="font-semibold text-yellow-400">{currentUser.role}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400 max-w-[110px] truncate">{currentUser.name.split(' ')[1] || currentUser.name}</span>
            </button>

            {roleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setRoleMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-neutral-900 rounded-xl shadow-xl border border-neutral-800 p-2 z-50">
                  <div className="px-3 py-2 text-xs font-semibold text-yellow-400 uppercase tracking-wider border-b border-neutral-800 mb-1">
                    Simulate Institutional Role
                  </div>
                  {allUsers.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-xs transition-colors ${
                          isSelected
                            ? 'bg-neutral-800 text-yellow-400 font-semibold border border-yellow-400/30'
                            : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {getRoleIcon(u.role)}
                          <div>
                            <div className="font-medium text-neutral-100">{u.name}</div>
                            <div className="text-[11px] text-neutral-400">{u.role} · {u.department.split('&')[0]}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-yellow-400" />}
                      </button>
                    );
                  })}
                  <div className="mt-2 pt-2 border-t border-neutral-800 px-3 py-1 text-[11px] text-neutral-500">
                    Switching changes UI permissions, approvals, and budget visibility.
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-900 rounded-lg transition-colors border border-transparent hover:border-neutral-800"
            title="System notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-neutral-950 ring-2 ring-neutral-950">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Mini Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-yellow-400/40"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
