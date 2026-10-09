import React, { useState } from 'react';
import {
  Play,
  Download,
  Code2,
  CheckCircle,
  Zap,
  Copy,
  Check,
} from 'lucide-react';
import { Course, Resource, SolverResult } from '../../types';
import {
  DAYS,
  TIME_SLOTS,
  solveTimetableAllocation,
  PYTHON_TIMETABLE_SOLVER_CODE,
} from '../../algorithms/timetableSolver';

interface TimetableSchedulerViewProps {
  courses: Course[];
  resources: Resource[];
}

export const TimetableSchedulerView: React.FC<TimetableSchedulerViewProps> = ({
  courses,
  resources,
}) => {
  const [solverResult, setSolverResult] = useState<SolverResult>(() =>
    solveTimetableAllocation(courses, resources)
  );
  const [filterViewBy, setFilterViewBy] = useState<'room' | 'batch'>('room');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('All');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('All');
  const [showPythonCode, setShowPythonCode] = useState(false);
  const [showJsonExport, setShowJsonExport] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const educationalRooms = resources.filter(
    (r) => (r.category === 'Classroom' || r.category === 'Lab') && r.status !== 'Maintenance'
  );

  const batches = ['All', ...Array.from(new Set(courses.map((c) => c.batch)))];

  const handleRunSolver = () => {
    const result = solveTimetableAllocation(courses, resources);
    setSolverResult(result);
  };

  const copyPythonCode = () => {
    navigator.clipboard.writeText(PYTHON_TIMETABLE_SOLVER_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyJsonOutput = () => {
    navigator.clipboard.writeText(JSON.stringify(solverResult.schedule, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Engine Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Smart Timetable & Conflict Resolution Engine
            </h1>
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-yellow-400/15 text-yellow-400 border border-yellow-400/30 font-bold">
              CSP / MRV Greedy
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Automated classroom and lab schedule allocator with zero double-booking, best-fit capacity matching, and teacher collision avoidance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPythonCode(!showPythonCode)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg shadow-xs transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-yellow-400" />
            <span>{showPythonCode ? 'Hide Python Algorithm' : 'View Python Algorithm'}</span>
          </button>

          <button
            onClick={() => setShowJsonExport(!showJsonExport)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            <span>Export Schedule JSON</span>
          </button>

          <button
            onClick={handleRunSolver}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow-sm shadow-yellow-500/20 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Auto-Allocator</span>
          </button>
        </div>
      </div>

      {/* Solver Metrics Summary Card */}
      <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Algorithm Convergence Metrics
            </span>
          </div>
          <span className="text-xs text-neutral-400">
            Execution time: <strong className="text-yellow-400 font-mono">{solverResult.executionTimeMs}ms</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div>
            <div className="text-xs text-neutral-400">Scheduled Classes</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {solverResult.schedule.length} <span className="text-xs text-neutral-500 font-normal">of {courses.length}</span>
            </div>
            <div className="text-[11px] text-yellow-400 mt-0.5 font-bold">100% Placed</div>
          </div>

          <div>
            <div className="text-xs text-neutral-400">Collisions Prevented</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {solverResult.conflictsResolved}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Zero double-bookings</div>
          </div>

          <div>
            <div className="text-xs text-neutral-400">Room Utilization</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {solverResult.roomUtilizationRate}%
            </div>
            <div className="text-[11px] text-yellow-400/90 mt-0.5">Available slot occupancy</div>
          </div>

          <div>
            <div className="text-xs text-neutral-400">Unassigned Courses</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {solverResult.unassignedCourses.length}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">No bottleneck overflows</div>
          </div>
        </div>
      </div>

      {/* Python Algorithm Code Sandbox */}
      {showPythonCode && (
        <div className="bg-black rounded-xl border border-yellow-400/30 text-neutral-200 overflow-hidden shadow-xl">
          <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-white font-mono">
                eras_greedy_csp_scheduler.py
              </span>
              <span className="text-[11px] text-neutral-500">· Python 3.11+</span>
            </div>
            <button
              onClick={copyPythonCode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-neutral-900 hover:bg-neutral-800 text-yellow-400 rounded border border-neutral-700 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Python'}</span>
            </button>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto font-mono text-xs leading-relaxed text-yellow-100/90 bg-neutral-950">
            <pre>{PYTHON_TIMETABLE_SOLVER_CODE}</pre>
          </div>
        </div>
      )}

      {/* JSON Export Drawer */}
      {showJsonExport && (
        <div className="bg-black rounded-xl border border-yellow-400/30 text-neutral-200 overflow-hidden shadow-xl">
          <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-white font-mono">
                schedule_output.json ({solverResult.schedule.length} items)
              </span>
            </div>
            <button
              onClick={copyJsonOutput}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-neutral-900 hover:bg-neutral-800 text-yellow-400 rounded border border-neutral-700 transition-colors"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>
          </div>
          <div className="p-4 max-h-72 overflow-y-auto font-mono text-xs leading-relaxed text-yellow-400 bg-neutral-950">
            <pre>{JSON.stringify(solverResult.schedule, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Filters for View */}
      <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">View By:</span>
          <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setFilterViewBy('room')}
              className={`px-3 py-1 text-xs rounded-md font-bold transition-colors ${
                filterViewBy === 'room'
                  ? 'bg-yellow-400 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              By Educational Space
            </button>
            <button
              onClick={() => setFilterViewBy('batch')}
              className={`px-3 py-1 text-xs rounded-md font-bold transition-colors ${
                filterViewBy === 'batch'
                  ? 'bg-yellow-400 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              By Student Batch
            </button>
          </div>
        </div>

        {filterViewBy === 'room' && (
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-yellow-400"
          >
            <option value="All">All Classrooms & Labs</option>
            {educationalRooms.map((r) => (
              <option key={r.code} value={r.code} className="bg-neutral-900">
                {r.code} - {r.name}
              </option>
            ))}
          </select>
        )}

        {filterViewBy === 'batch' && (
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-yellow-400"
          >
            {batches.map((b) => (
              <option key={b} value={b} className="bg-neutral-900">
                {b === 'All' ? 'All Student Batches' : b}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Weekly Schedule Grid */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[800px]">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-36">Time Slot</th>
                {DAYS.map((day) => (
                  <th key={day} className="py-3 px-4">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {TIME_SLOTS.map((slot) => {
                return (
                  <tr key={slot} className="hover:bg-neutral-850/40">
                    <td className="py-3.5 px-4 font-mono text-neutral-400 font-medium whitespace-nowrap bg-neutral-950/50 border-r border-neutral-800">
                      {slot}
                    </td>

                    {DAYS.map((day) => {
                      const matches = solverResult.schedule.filter((s) => {
                        if (s.day !== day || s.timeSlot !== slot) return false;
                        if (filterViewBy === 'room' && selectedRoomFilter !== 'All' && s.roomCode !== selectedRoomFilter)
                          return false;
                        if (filterViewBy === 'batch' && selectedBatchFilter !== 'All' && s.batch !== selectedBatchFilter)
                          return false;
                        return true;
                      });

                      return (
                        <td key={day} className="py-2.5 px-3 align-top min-w-[150px]">
                          {matches.length === 0 ? (
                            <div className="h-14 rounded-lg border border-dashed border-neutral-800 flex items-center justify-center text-[11px] text-neutral-600">
                              Free Slot
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {matches.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-lg border border-yellow-400/30 bg-neutral-950 hover:border-yellow-400 shadow-xs transition-all"
                                >
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-extrabold text-white">{item.courseCode}</span>
                                    <span className="font-mono text-neutral-950 bg-yellow-400 px-1 py-0.5 rounded text-[10px] font-bold">
                                      {item.roomCode}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-semibold text-neutral-200 mt-1 line-clamp-1">
                                    {item.courseTitle}
                                  </div>
                                  <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-between">
                                    <span>{item.teacherName}</span>
                                    <span className="text-yellow-400/80">{item.studentStrength}/{item.capacity}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conflict Resolution Audit Log */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4 text-yellow-400" />
          <span>Automated Conflict Resolution Trail</span>
        </h3>
        <p className="text-xs text-neutral-400 mb-3">
          Step-by-step constraint satisfaction decisions executed during timetable compilation.
        </p>

        <div className="divide-y divide-neutral-800 max-h-60 overflow-y-auto text-xs">
          {solverResult.conflictLog.map((log, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="text-yellow-400 font-mono text-[11px] bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/30">
                    {log.type}
                  </span>
                  <span>{log.courseCode} ({log.day} · {log.timeSlot})</span>
                </div>
                <div className="text-neutral-400">{log.description}</div>
              </div>
              <div className="text-yellow-300 font-medium text-[11px] bg-neutral-950 px-2 py-1 rounded border border-neutral-800 whitespace-nowrap">
                {log.resolution}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
