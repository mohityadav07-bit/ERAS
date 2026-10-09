import React, { useState } from 'react';
import {
  Building2,
  Users,
  Clock,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Resource, RoomStatus } from '../../types';

interface ResourceAvailabilityGridProps {
  resources: Resource[];
  onSelectResourceForBooking: (resource: Resource) => void;
  onRequestResource: (resourceId?: string) => void;
  selectedStatusFilter?: string;
  onClearStatusFilter?: () => void;
}

export const ResourceAvailabilityGrid: React.FC<ResourceAvailabilityGridProps> = ({
  resources,
  onSelectResourceForBooking,
  onRequestResource,
  selectedStatusFilter,
  onClearStatusFilter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('Now (10:30 - 12:00)');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const buildings = ['All', ...Array.from(new Set(resources.map((r) => r.building)))];
  const categories = ['All', 'Classroom', 'Lab', 'Equipment'];
  const timeSlots = [
    'Now (10:30 - 12:00)',
    '12:00 - 13:30',
    '14:00 - 15:30',
    '15:45 - 17:15',
  ];

  const filteredResources = resources.filter((r) => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    if (selectedBuilding !== 'All' && r.building !== selectedBuilding) return false;
    if (selectedStatusFilter && r.status !== selectedStatusFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCode = r.code.toLowerCase().includes(q);
      const matchFeature = r.features.some((f) => f.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchFeature) return false;
    }
    return true;
  });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-sm shadow-yellow-400" />
            Available Now
          </span>
        );
      case 'Occupied':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            In Session
          </span>
        );
      case 'Reserved':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-neutral-400" />
            Reserved
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-neutral-600" />
            Maintenance
          </span>
        );
    }
  };

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-sm">
      {/* Header & Controls Bar */}
      <div className="p-5 border-b border-neutral-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Classroom & Laboratory Live Availability
              </h2>
              {selectedStatusFilter && (
                <div className="flex items-center gap-1 text-xs text-yellow-400 bg-neutral-800 border border-yellow-400/30 px-2 py-0.5 rounded">
                  <span>Filtered: {selectedStatusFilter}</span>
                  {onClearStatusFilter && (
                    <button
                      onClick={onClearStatusFilter}
                      className="text-neutral-400 hover:text-white font-bold ml-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Real-time occupancy status, sensor-verified seating, and installed facility tags.
            </p>
          </div>

          {/* Time Slot Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              Window:
            </span>
            <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                    selectedTimeSlot === slot
                      ? 'bg-yellow-400 text-neutral-950 shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {slot.replace('Now ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Pills / Buttons & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-yellow-400 text-neutral-950 shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat === 'All' ? 'All Types' : cat}
                </button>
              ))}
            </div>

            {/* Building Selector */}
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-yellow-400"
            >
              {buildings.map((b) => (
                <option key={b} value={b} className="bg-neutral-900 text-white">
                  {b === 'All' ? 'All Academic Blocks' : b}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by feature (e.g., GPU, Laser)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="p-5">
        {filteredResources.length === 0 ? (
          <div className="py-12 text-center text-neutral-500">
            <Building2 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-300">No matching spaces found</p>
            <p className="text-xs text-neutral-500 mt-1">Try adjusting the building or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredResources.map((resource) => {
              const isAvailable = resource.status === 'Available';

              return (
                <div
                  key={resource.id}
                  className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
                    isAvailable
                      ? 'border-yellow-400/30 hover:border-yellow-400 bg-neutral-950 hover:shadow-md hover:shadow-yellow-500/5'
                      : resource.status === 'Maintenance'
                      ? 'border-neutral-800 bg-neutral-950/40 opacity-70'
                      : 'border-neutral-800 bg-neutral-950'
                  }`}
                >
                  {/* Top: Header & Status */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-yellow-400">
                            {resource.code}
                          </span>
                          <span className="text-[11px] text-neutral-600">·</span>
                          <span className="text-[11px] text-neutral-400">{resource.type}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                          {resource.name}
                        </h3>
                      </div>
                      <div>{getStatusBadge(resource.status)}</div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-yellow-400/80" />
                        <strong className="font-bold text-white">{resource.capacity}</strong> seats
                      </span>
                      <span aria-hidden="true" className="text-neutral-700">·</span>
                      <span className="truncate">
                        {resource.building.split(' ')[0]} (Fl {resource.floor})
                      </span>
                    </div>

                    {/* Occupancy Context */}
                    {resource.status === 'Occupied' && resource.currentCourse && (
                      <div className="mt-3 p-2.5 rounded-lg bg-neutral-900 border border-amber-500/30 text-xs text-amber-200">
                        <div className="font-semibold truncate">{resource.currentCourse}</div>
                        <div className="text-[11px] text-amber-300/80 mt-0.5 flex items-center justify-between">
                          <span>{resource.currentOccupant}</span>
                          <span>Until {resource.currentEndsAt}</span>
                        </div>
                      </div>
                    )}

                    {resource.status === 'Reserved' && (
                      <div className="mt-3 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
                        <div className="font-semibold truncate">{resource.currentCourse || 'Reserved Session'}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {resource.currentOccupant} · Until {resource.currentEndsAt}
                        </div>
                      </div>
                    )}

                    {resource.status === 'Maintenance' && (
                      <div className="mt-3 p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400">
                        Scheduled recalibration & floor grounding audit.
                      </div>
                    )}

                    {/* Features list */}
                    <div className="mt-3 text-[11px] text-neutral-400 flex flex-wrap gap-x-1.5 gap-y-0.5">
                      {resource.features.slice(0, 3).map((feature, idx) => (
                        <span key={feature} className="inline-flex items-center gap-1">
                          {idx > 0 && <span aria-hidden="true" className="text-neutral-700">·</span>}
                          <span>{feature}</span>
                        </span>
                      ))}
                      {resource.features.length > 3 && (
                        <span className="text-neutral-600">+{resource.features.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 pt-3 border-t border-neutral-850 flex items-center justify-between">
                    <button
                      onClick={() => onSelectResourceForBooking(resource)}
                      className="text-xs text-neutral-400 hover:text-white font-medium"
                    >
                      View Specs
                    </button>

                    {isAvailable ? (
                      <button
                        onClick={() => onRequestResource(resource.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 rounded-md transition-colors shadow-xs shadow-yellow-500/20"
                      >
                        Book Slot
                        <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onRequestResource(resource.id)}
                        className="text-xs text-neutral-400 hover:text-yellow-400 hover:underline"
                      >
                        Reserve Later
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
