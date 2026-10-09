import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  Clock,
  Coins,
  Wrench,
} from 'lucide-react';
import { SystemNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onActionClick?: (notif: SystemNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onActionClick,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'budget':
        return <Coins className="w-4 h-4 text-yellow-300" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-neutral-400" />;
      default:
        return <Bell className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-bold text-white">Notifications & Alerts</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-neutral-400 hover:text-yellow-400 font-medium"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800 p-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              All caught up! No notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg transition-colors ${
                  n.read ? 'bg-neutral-900/60 opacity-60' : 'bg-neutral-950 border border-yellow-400/20'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-neutral-900 rounded-md border border-neutral-800 shadow-xs mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{n.title}</span>
                      <span className="text-[10px] text-neutral-500">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      {n.actionableId && onActionClick && (
                        <button
                          onClick={() => onActionClick(n)}
                          className="font-bold text-yellow-400 hover:underline"
                        >
                          Review Reservation →
                        </button>
                      )}
                      {!n.read && (
                        <button
                          onClick={() => onMarkAsRead(n.id)}
                          className="text-neutral-500 hover:text-yellow-400 ml-auto"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
