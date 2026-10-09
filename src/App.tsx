import React, { useState } from 'react';
import {
  Booking,
  DepartmentBudget,
  InventoryItem,
  Resource,
  SystemNotification,
  User,
} from './types';
import {
  INITIAL_BOOKINGS,
  INITIAL_BUDGETS,
  INITIAL_INVENTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_RESOURCES,
  INITIAL_USERS,
  SAMPLE_COURSES,
} from './data/mockData';
import { NavTab, Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { KpiCards } from './components/dashboard/KpiCards';
import { ResourceAvailabilityGrid } from './components/dashboard/ResourceAvailabilityGrid';
import { BookingView } from './components/booking/BookingView';
import { TimetableSchedulerView } from './components/timetable/TimetableSchedulerView';
import { BudgetAllocationView } from './components/budget/BudgetAllocationView';
import { InventoryView } from './components/inventory/InventoryView';
import { ReportsView } from './components/reports/ReportsView';
import { ArchitectureDocsView } from './components/architecture/ArchitectureDocsView';
import { RequestResourceModal } from './components/modals/RequestResourceModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Starts as Admin
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [budgets, setBudgets] = useState<DepartmentBudget[]>(INITIAL_BUDGETS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // UI state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [preselectedResourceId, setPreselectedResourceId] = useState<string | undefined>(undefined);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pendingRequestsCount = bookings.filter((b) => b.status === 'Pending').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const handleOpenRequestModal = (resourceId?: string) => {
    setPreselectedResourceId(resourceId);
    setIsRequestModalOpen(true);
  };

  const handleAddBooking = (newBookingData: Omit<Booking, 'id' | 'requestedAt'>) => {
    const newId = `bk-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdBooking: Booking = {
      ...newBookingData,
      id: newId,
      requestedAt: 'Just now',
    };

    setBookings([createdBooking, ...bookings]);

    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Reservation Submitted',
      message: `${createdBooking.userName} requested ${createdBooking.resourceName} for ${createdBooking.date}.`,
      timestamp: 'Just now',
      read: false,
      type: 'booking',
      priority: createdBooking.priority === 'Urgent' ? 'warning' : 'info',
      actionableId: newId,
    };
    setNotifications([newNotif, ...notifications]);

    showToast(
      createdBooking.status === 'Approved'
        ? 'Reservation confirmed and space locked.'
        : 'Request submitted for HOD review.'
    );
    return { success: true };
  };

  const handleApproveBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Approved', approvedBy: currentUser.name } : b))
    );
    showToast('Reservation approved successfully.');
  };

  const handleRejectBooking = (id: string, reason?: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: 'Rejected', rejectionReason: reason || 'Scheduling priority conflict' } : b
      )
    );
    showToast('Reservation request declined.', 'error');
  };

  const handleAddExpense = (
    deptId: string,
    expense: { description: string; amount: number; category: string }
  ) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.departmentId === deptId) {
          const newExp = {
            id: `exp-${Date.now()}`,
            description: expense.description,
            amount: expense.amount,
            date: new Date().toISOString().split('T')[0],
            approvedBy: currentUser.name,
            category: expense.category,
          };
          return {
            ...b,
            spent: b.spent + expense.amount,
            recentExpenses: [newExp, ...b.recentExpenses],
            categories: b.categories.map((c) =>
              c.name === expense.category ? { ...c, spent: c.spent + expense.amount } : c
            ),
          };
        }
        return b;
      })
    );
    showToast('Procurement transaction recorded to department budget.');
  };

  return (
    <div className="flex h-screen bg-black text-neutral-100 font-sans overflow-hidden">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-2xl border border-yellow-400/40 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-yellow-400 stroke-[2.5]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-neutral-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={currentUser.role}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black">
        {/* Top Bar with Search & Role Switcher */}
        <TopBar
          currentUser={currentUser}
          allUsers={INITIAL_USERS}
          onSwitchUser={(u) => {
            setCurrentUser(u);
            showToast(`Switched active persona to ${u.role}: ${u.name}`);
          }}
          onRequestResource={() => handleOpenRequestModal()}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          unreadNotificationsCount={unreadNotificationsCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-neutral-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentTab === 'dashboard' && (
              <>
                {/* 4 Required KPI Cards */}
                <KpiCards
                  resources={resources}
                  bookings={bookings}
                  budgets={budgets}
                  onFilterAvailableRooms={() => {
                    setStatusFilter('Available');
                  }}
                  onFilterPendingRequests={() => {
                    setCurrentTab('bookings');
                  }}
                  onNavigateBudget={() => {
                    setCurrentTab('budget');
                  }}
                  onNavigateTimetable={() => {
                    setCurrentTab('timetable');
                  }}
                />

                {/* Interactive Grid View for Classroom/Lab real-time availability */}
                <ResourceAvailabilityGrid
                  resources={resources}
                  onSelectResourceForBooking={(r) => handleOpenRequestModal(r.id)}
                  onRequestResource={(id) => handleOpenRequestModal(id)}
                  selectedStatusFilter={statusFilter}
                  onClearStatusFilter={() => setStatusFilter(undefined)}
                />
              </>
            )}

            {currentTab === 'bookings' && (
              <BookingView
                bookings={bookings}
                resources={resources}
                currentUser={currentUser}
                onApproveBooking={handleApproveBooking}
                onRejectBooking={handleRejectBooking}
                onRequestNew={() => handleOpenRequestModal()}
              />
            )}

            {currentTab === 'timetable' && (
              <TimetableSchedulerView courses={SAMPLE_COURSES} resources={resources} />
            )}

            {currentTab === 'budget' && (
              <BudgetAllocationView
                budgets={budgets}
                currentUser={currentUser}
                onAddExpense={handleAddExpense}
              />
            )}

            {currentTab === 'inventory' && (
              <InventoryView
                inventory={inventory}
                onUpdateInventoryItem={(updated) => {
                  setInventory((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
                }}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView resources={resources} bookings={bookings} />
            )}

            {currentTab === 'architecture' && <ArchitectureDocsView />}
          </div>
        </main>
      </div>

      {/* Quick Request Resource Modal with Conflict Prevention */}
      <RequestResourceModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        resources={resources}
        bookings={bookings}
        currentUser={currentUser}
        preselectedResourceId={preselectedResourceId}
        onSubmitBooking={handleAddBooking}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        }}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onActionClick={(notif) => {
          setIsNotificationDrawerOpen(false);
          setCurrentTab('bookings');
        }}
      />
    </div>
  );
}
