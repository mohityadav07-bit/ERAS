import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { Booking, PriorityLevel, Resource, ResourceCategory, User } from '../../types';

interface RequestResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: Resource[];
  bookings: Booking[];
  currentUser: User;
  preselectedResourceId?: string;
  onSubmitBooking: (newBooking: Omit<Booking, 'id' | 'requestedAt'>) => {
    success: boolean;
    error?: string;
  };
}

export const RequestResourceModal: React.FC<RequestResourceModalProps> = ({
  isOpen,
  onClose,
  resources,
  bookings,
  currentUser,
  preselectedResourceId,
  onSubmitBooking,
}) => {
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>('Classroom');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [date, setDate] = useState<string>('2026-10-14');
  const [startTime, setStartTime] = useState<string>('10:30');
  const [endTime, setEndTime] = useState<string>('12:00');
  const [purpose, setPurpose] = useState<string>('');
  const [expectedAttendance, setExpectedAttendance] = useState<number>(40);
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedResourceId) {
      const match = resources.find((r) => r.id === preselectedResourceId);
      if (match) {
        setSelectedResourceId(match.id);
        setResourceCategory(match.category);
      }
    } else {
      const defaultMatch = resources.find((r) => r.category === resourceCategory);
      if (defaultMatch) {
        setSelectedResourceId(defaultMatch.id);
      }
    }
  }, [preselectedResourceId, resourceCategory, resources, isOpen]);

  useEffect(() => {
    if (!selectedResourceId || !date || !startTime || !endTime) {
      setConflictWarning(null);
      return;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      setConflictWarning('End time must be after start time.');
      return;
    }

    const collision = bookings.find((b) => {
      if (b.resourceId !== selectedResourceId) return false;
      if (b.date !== date) return false;
      if (b.status === 'Rejected' || b.status === 'Cancelled') return false;

      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);

      return startMinutes < bEnd && endMinutes > bStart;
    });

    if (collision) {
      setConflictWarning(
        `Time collision detected! Already booked by ${collision.userName} (${collision.startTime} - ${collision.endTime}) for "${collision.purpose}".`
      );
    } else {
      setConflictWarning(null);
    }
  }, [selectedResourceId, date, startTime, endTime, bookings]);

  if (!isOpen) return null;

  function timeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  const categoryFilteredResources = resources.filter((r) => r.category === resourceCategory);
  const activeResource = resources.find((r) => r.id === selectedResourceId);

  const availableFeatures = [
    '4K Laser Projector',
    'Interactive Smart Board',
    'Dual Mic Podiums',
    'High-Performance GPUs',
    'Audio Recording Rig',
    'Air Conditioning',
  ];

  const handleToggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!purpose.trim()) {
      setFormError('Please describe the academic or institutional purpose of the booking.');
      return;
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      setFormError('End time must be after start time.');
      return;
    }

    if (activeResource && expectedAttendance > activeResource.capacity) {
      setFormError(
        `Expected attendance (${expectedAttendance}) exceeds maximum room capacity (${activeResource.capacity}). Choose a larger hall or adjust attendance.`
      );
      return;
    }

    const result = onSubmitBooking({
      resourceId: selectedResourceId,
      resourceName: activeResource ? `${activeResource.name} (${activeResource.code})` : 'Selected Resource',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      department: currentUser.department,
      date,
      startTime,
      endTime,
      purpose,
      expectedAttendance,
      priority,
      status: currentUser.role === 'Admin' ? 'Approved' : 'Pending',
      approvedBy: currentUser.role === 'Admin' ? currentUser.name : undefined,
      equipmentRequested: selectedFeatures,
    });

    if (result.success) {
      onClose();
      setPurpose('');
      setSelectedFeatures([]);
    } else {
      setFormError(result.error || 'Failed to submit booking.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-2xl max-w-xl w-full border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Request Educational Resource</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                Live Guard
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Submit reservation with automated conflict checking and capacity enforcement.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Conflict Warning Alert */}
          {conflictWarning && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/50 rounded-lg flex items-start gap-2.5 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-yellow-300">Booking Conflict Alert:</strong> {conflictWarning}
              </div>
            </div>
          )}

          {formError && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-lg flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>{formError}</div>
            </div>
          )}

          {/* 1. Resource Type & Resource Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Resource Type
              </label>
              <select
                value={resourceCategory}
                onChange={(e) => setResourceCategory(e.target.value as ResourceCategory)}
                className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="Classroom">Lecture Hall / Classroom</option>
                <option value="Lab">Computer / Science Lab</option>
                <option value="Equipment">High-End Equipment</option>
                <option value="Software License">Software License Pool</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Specific Space / Asset
              </label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
              >
                {categoryFilteredResources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} - {r.name} (Cap: {r.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room Specs Snippet */}
          {activeResource && (
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-yellow-400">{activeResource.name}</span>
                <span className="text-neutral-600">·</span>
                <span>{activeResource.building}</span>
              </div>
              <span className="font-semibold text-neutral-200">Max Capacity: {activeResource.capacity}</span>
            </div>
          )}

          {/* 2. Date and Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Reservation Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                required
              />
            </div>
          </div>

          {/* 3. Expected Attendance & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Expected Student Strength
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={expectedAttendance}
                onChange={(e) => setExpectedAttendance(Number(e.target.value))}
                className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="Low">Low (Informal / Routine)</option>
                <option value="Medium">Medium (Regular Class / Lab)</option>
                <option value="High">High (Mid-term / Symposium)</option>
                <option value="Urgent">Urgent (Accreditation / VIP Lecture)</option>
              </select>
            </div>
          </div>

          {/* 4. Purpose Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Purpose & Academic Context
            </label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., CS301 Operating Systems Concurrency Lab Practicum..."
              className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-400"
              required
            />
          </div>

          {/* 5. Equipment & Facilities Needed */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Required Facility Equipment
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {availableFeatures.map((feat) => {
                const checked = selectedFeatures.includes(feat);
                return (
                  <button
                    type="button"
                    key={feat}
                    onClick={() => handleToggleFeature(feat)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                      checked
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300 font-semibold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        checked ? 'bg-yellow-400 border-yellow-400 text-neutral-950 font-bold' : 'border-neutral-700 bg-neutral-900'
                      }`}
                    >
                      {checked && <span className="text-[10px] leading-none">✓</span>}
                    </div>
                    <span className="truncate">{feat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400">
            {currentUser.role === 'Admin'
              ? 'Admin role: Booking will be auto-approved immediately.'
              : 'Submitted to HOD/Admin approval pipeline.'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={Boolean(conflictWarning)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm ${
                conflictWarning
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'bg-yellow-400 text-neutral-950 hover:bg-yellow-300 active:bg-yellow-500 shadow-yellow-500/20'
              }`}
            >
              {currentUser.role === 'Admin' ? 'Confirm Reservation' : 'Submit for Approval'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
