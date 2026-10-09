import React, { useState } from 'react';
import {
  Database,
  Code2,
  Calendar,
  Layers,
  Copy,
  Check,
  Server,
  Key,
  Terminal,
  FileCode2,
  GitBranch,
} from 'lucide-react';
import {
  API_ENDPOINTS,
  ER_ENTITIES,
  FRONTEND_ARCHITECTURE_SPEC,
  MONGODB_SCHEMA_DOC,
  POSTGRESQL_SCHEMA_SQL,
  ROADMAP_SPRINTS,
} from '../../data/systemArchitecture';
import { PYTHON_TIMETABLE_SOLVER_CODE } from '../../algorithms/timetableSolver';

export const ArchitectureDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'er-diagram' | 'postgresql' | 'mongodb' | 'api' | 'roadmap' | 'frontend' | 'python'
  >('er-diagram');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white tracking-tight">
            System Design Architecture & Technical Specifications
          </h1>
          <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-yellow-400/15 text-yellow-400 border border-yellow-400/30 font-bold">
            ERAS BLUEPRINTS
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Complete database schema, anti-double-booking constraints, RESTful API contract, 4-Sprint roadmap, and algorithmic models.
        </p>
      </div>

      {/* Module Navigation Tabs */}
      <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'er-diagram', label: 'ER Diagram / Schema', icon: Database },
          { id: 'postgresql', label: 'PostgreSQL DDL & Triggers', icon: Terminal },
          { id: 'mongodb', label: 'MongoDB Schema', icon: FileCode2 },
          { id: 'api', label: 'RESTful API Architecture', icon: Server },
          { id: 'roadmap', label: '4-Sprint Roadmap', icon: Calendar },
          { id: 'frontend', label: 'Frontend State & Routing', icon: Layers },
          { id: 'python', label: 'Python Solver Function', icon: Code2 },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-yellow-400 text-neutral-950 shadow-sm shadow-yellow-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Interactive ER Diagram & Database Schema */}
      {activeTab === 'er-diagram' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 shadow-xs">
            <h3 className="text-sm font-bold text-white mb-1">Entity-Relationship Visual Model</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Relational architecture mapping user roles, academic departments, classroom/lab resources, exclusion-guarded bookings, and budgetary ledger entries.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ER_ENTITIES.map((entity) => (
                <div
                  key={entity.tableName}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-sm hover:border-yellow-400/40 transition-all"
                >
                  <div className="p-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">{entity.name}</div>
                      <div className="font-mono text-[11px] text-yellow-400/80">table: {entity.tableName}</div>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      {entity.fields.length} cols
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-neutral-850 text-[11px]">
                    {entity.fields.map((field) => (
                      <div key={field.name} className="py-1.5 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {field.isPk && <Key className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                          {field.isFk && <GitBranch className="w-3 h-3 text-neutral-400 flex-shrink-0" />}
                          <span className={`font-mono truncate ${field.isPk ? 'font-bold text-yellow-400' : 'text-neutral-200'}`}>
                            {field.name}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-mono text-neutral-400 text-[10px]">{field.type}</span>
                          {field.refTable && (
                            <span className="block text-[9px] text-yellow-400/80 font-mono">
                              → {field.refTable}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PostgreSQL DDL & Anti-Double-Booking Trigger */}
      {activeTab === 'postgresql' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex items-center justify-between shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-white">PostgreSQL Schema & Exclusion Constraints</h3>
              <p className="text-xs text-neutral-400">
                Includes <code className="font-mono text-yellow-400">btree_gist</code> exclusion constraint, PL/pgSQL collision trigger, and index optimizations.
              </p>
            </div>
            <button
              onClick={() => handleCopy(POSTGRESQL_SCHEMA_SQL, 'pg-sql')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-colors shadow-xs"
            >
              {copiedKey === 'pg-sql' ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'pg-sql' ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <div className="bg-black rounded-xl border border-neutral-800 text-neutral-200 p-4 max-h-[600px] overflow-y-auto font-mono text-xs leading-relaxed">
            <pre className="text-yellow-100/90">{POSTGRESQL_SCHEMA_SQL}</pre>
          </div>
        </div>
      )}

      {/* Tab 3: MongoDB Schema */}
      {activeTab === 'mongodb' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex items-center justify-between shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-white">MongoDB / Mongoose Document Schemas</h3>
              <p className="text-xs text-neutral-400">
                Flexible NoSQL data models with compound indexing for time-range collision scans.
              </p>
            </div>
            <button
              onClick={() => handleCopy(MONGODB_SCHEMA_DOC, 'mongo-doc')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-colors shadow-xs"
            >
              {copiedKey === 'mongo-doc' ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'mongo-doc' ? 'Copied Mongoose!' : 'Copy Schemas'}</span>
            </button>
          </div>

          <div className="bg-black rounded-xl border border-neutral-800 text-neutral-200 p-4 max-h-[600px] overflow-y-auto font-mono text-xs leading-relaxed">
            <pre className="text-yellow-400">{MONGODB_SCHEMA_DOC}</pre>
          </div>
        </div>
      )}

      {/* Tab 4: RESTful API Endpoints Architecture */}
      {activeTab === 'api' && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-white">RESTful API Contract</h3>
            <p className="text-xs text-neutral-400">
              Enterprise endpoints with Role-Based Access Control (RBAC), atomic collision guards, and JSON schemas.
            </p>
          </div>

          <div className="divide-y divide-neutral-800">
            {API_ENDPOINTS.map((endpoint, idx) => (
              <div key={idx} className="p-5 hover:bg-neutral-850/50 transition-colors space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                        endpoint.method === 'GET'
                          ? 'bg-yellow-400 text-neutral-950 border-yellow-400'
                          : endpoint.method === 'POST'
                          ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40'
                          : endpoint.method === 'PATCH'
                          ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      {endpoint.path}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-sans">
                      · {endpoint.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-neutral-500">Roles:</span>
                    {endpoint.authRoles.map((role) => (
                      <span key={role} className="text-[11px] text-neutral-300 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-neutral-400">{endpoint.description}</p>

                {/* Sample Payloads */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs font-mono">
                  {endpoint.requestBody && (
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                      <div className="text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        Request Body (JSON)
                      </div>
                      <pre className="text-neutral-300 text-[11px] overflow-x-auto">
                        {endpoint.requestBody}
                      </pre>
                    </div>
                  )}

                  <div className="bg-black p-3 rounded-lg border border-neutral-850 text-neutral-200">
                    <div className="text-[10px] font-sans font-bold text-yellow-400 uppercase tracking-wider mb-1">
                      Success Response ({endpoint.statusCodes[0]} OK)
                    </div>
                    <pre className="text-yellow-400 text-[11px] overflow-x-auto">
                      {endpoint.responseBody}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: 4-Sprint Modular Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xs">
            <h3 className="text-sm font-bold text-white">Modular Development Roadmap (4 Sprints)</h3>
            <p className="text-xs text-neutral-400">
              Structured agile delivery plan dividing ERAS into 4 iterative sprints with user stories and acceptance gates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROADMAP_SPRINTS.map((sprint) => (
              <div
                key={sprint.sprintNumber}
                className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-white">{sprint.duration}</span>
                    <span className="font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30 text-[11px] font-bold">
                      Sprint {sprint.sprintNumber}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-yellow-400">{sprint.title}</h4>
                  <p className="text-xs text-neutral-400 mt-1 mb-4">{sprint.goal}</p>

                  <div className="space-y-3 border-t border-neutral-800 pt-3">
                    {sprint.stories.map((story, idx) => (
                      <div key={idx} className="text-xs bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{story.title}</span>
                          <span className="font-mono text-[10px] text-yellow-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-700">
                            {story.points} pts
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1 text-neutral-400 text-[11px]">
                          {story.tasks.map((task, tidx) => (
                            <li key={tidx} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-yellow-400" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Frontend State & Routing Architecture */}
      {activeTab === 'frontend' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-xs">
            <h3 className="text-sm font-bold text-white">
              React / Next.js State Management & Routing Architecture
            </h3>
            <p className="text-xs text-neutral-400">
              Zustand centralized store model, optimistic reservation caching, and App Router directory hierarchy with RBAC guards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-black rounded-xl border border-neutral-800 text-neutral-200 p-4 font-mono text-xs">
              <div className="text-[11px] text-yellow-400 font-sans font-bold mb-2 uppercase tracking-wider">
                State Management (Zustand Store Interface)
              </div>
              <pre className="text-yellow-400 overflow-x-auto">
                {FRONTEND_ARCHITECTURE_SPEC.stateManagement}
              </pre>
            </div>

            <div className="bg-black rounded-xl border border-neutral-800 text-neutral-200 p-4 font-mono text-xs">
              <div className="text-[11px] text-neutral-400 font-sans font-bold mb-2 uppercase tracking-wider">
                Next.js App Router Structure
              </div>
              <pre className="text-neutral-200 overflow-x-auto">
                {FRONTEND_ARCHITECTURE_SPEC.routingStructure}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Python Timetable Solver Function */}
      {activeTab === 'python' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex items-center justify-between shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-white">
                Python Timetable & Conflict Resolution Algorithm
              </h3>
              <p className="text-xs text-neutral-400">
                Greedy + Constraint Satisfaction Problem (CSP) function allocating classrooms and labs with zero conflicts.
              </p>
            </div>
            <button
              onClick={() => handleCopy(PYTHON_TIMETABLE_SOLVER_CODE, 'py-solver')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-colors shadow-xs"
            >
              {copiedKey === 'py-solver' ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'py-solver' ? 'Copied Python!' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="bg-black rounded-xl border border-neutral-800 text-neutral-200 p-4 max-h-[600px] overflow-y-auto font-mono text-xs leading-relaxed">
            <pre className="text-yellow-100/90">{PYTHON_TIMETABLE_SOLVER_CODE}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
