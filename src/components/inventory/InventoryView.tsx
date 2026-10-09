import React, { useState } from 'react';
import {
  Search,
} from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onUpdateInventoryItem?: (item: InventoryItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory: initialInventory,
  onUpdateInventoryItem,
}) => {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchTag = item.assetTag.toLowerCase().includes(q);
      const matchLocation = item.location.toLowerCase().includes(q);
      if (!matchName && !matchTag && !matchLocation) return false;
    }
    return true;
  });

  const handleCheckout = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id && it.quantityAvailable > 0) {
          const updated = { ...it, quantityAvailable: it.quantityAvailable - 1 };
          if (onUpdateInventoryItem) onUpdateInventoryItem(updated);
          return updated;
        }
        return it;
      })
    );
  };

  const handleCheckin = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id && it.quantityAvailable < it.quantityTotal) {
          const updated = { ...it, quantityAvailable: it.quantityAvailable + 1 };
          if (onUpdateInventoryItem) onUpdateInventoryItem(updated);
          return updated;
        }
        return it;
      })
    );
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'Optimal':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            Optimal Condition
          </span>
        );
      case 'Fair':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Fair
          </span>
        );
      case 'Under Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Maintenance
          </span>
        );
      default:
        return <span className="text-xs text-neutral-400">{condition}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Campus Equipment & Software Inventory
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Catalog of departmental lab instrumentation, mobile workstation hardware, and university software license pools.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Asset Category:</span>
          <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            {['All', 'Hardware', 'AudioVisual', 'LabEquipment', 'Software'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  categoryFilter === cat
                    ? 'bg-yellow-400 text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat === 'AudioVisual' ? 'Audio-Visual' : cat === 'LabEquipment' ? 'Lab Gear' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by asset tag, name, location..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Asset Name & Tag</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Deployment Location</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Available / Total</th>
                <th className="py-3 px-4">Maintenance Schedule</th>
                <th className="py-3 px-4 text-right">Circulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-850/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="font-mono text-[11px] text-yellow-400/80">{item.assetTag}</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-neutral-300">{item.category}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-neutral-200">{item.location}</div>
                    <div className="text-[11px] text-neutral-400">{item.assignedDepartment}</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getConditionBadge(item.condition)}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-yellow-400">
                        {item.quantityAvailable} / {item.quantityTotal}
                      </span>
                      <div className="w-16 bg-neutral-950 rounded-full h-1.5 overflow-hidden border border-neutral-800">
                        <div
                          className="bg-yellow-400 h-full rounded-full"
                          style={{
                            width: `${Math.round((item.quantityAvailable / item.quantityTotal) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-neutral-400">
                    {item.nextMaintenanceDate || 'Continuous audit'}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleCheckout(item.id)}
                        disabled={item.quantityAvailable <= 0}
                        className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                          item.quantityAvailable > 0
                            ? 'bg-yellow-400 text-neutral-950 hover:bg-yellow-300 shadow-xs'
                            : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                        }`}
                      >
                        Check Out
                      </button>
                      <button
                        onClick={() => handleCheckin(item.id)}
                        disabled={item.quantityAvailable >= item.quantityTotal}
                        className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                          item.quantityAvailable < item.quantityTotal
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                            : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                        }`}
                      >
                        Return
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
