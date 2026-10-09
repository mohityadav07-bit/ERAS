import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
} from 'lucide-react';
import { DepartmentBudget, User } from '../../types';

interface BudgetAllocationViewProps {
  budgets: DepartmentBudget[];
  currentUser: User;
  onAddExpense?: (deptId: string, expense: { description: string; amount: number; category: string }) => void;
}

export const BudgetAllocationView: React.FC<BudgetAllocationViewProps> = ({
  budgets,
  currentUser,
  onAddExpense,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(budgets[0]?.id || '');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Laboratory Hardware & GPUs');

  const activeBudget = budgets.find((b) => b.id === selectedDeptId) || budgets[0];

  const totalAllocated = budgets.reduce((sum, b) => sum + b.totalAllocated, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPct = Math.round((totalSpent / totalAllocated) * 100);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount || Number(expenseAmount) <= 0) return;

    if (onAddExpense) {
      onAddExpense(activeBudget.departmentId, {
        description: expenseDesc,
        amount: Number(expenseAmount),
        category: expenseCategory,
      });
    }

    setExpenseDesc('');
    setExpenseAmount('');
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Academic Budget Allocation & Expenditure Ledger
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Departmental resource procurement pools, fiscal year tracking, and capital asset accounting.
          </p>
        </div>

        {(currentUser.role === 'Admin' || currentUser.role === 'HOD') && (
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 text-xs font-bold rounded-lg shadow-sm shadow-yellow-500/20 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Procurement Expense</span>
          </button>
        )}
      </div>

      {/* Global Campus Budget Overview */}
      <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="text-xs text-neutral-400">Total Approved FY 2026-27 Pool</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            ${totalAllocated.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500 mt-1">STEM Faculty Core Allocation</div>
        </div>

        <div>
          <div className="text-xs text-neutral-400">Total Expenditures Incurred</div>
          <div className="text-2xl font-extrabold text-yellow-400 mt-1">
            ${totalSpent.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
            <span className="font-bold text-white">{overallPct}%</span>
            <span>of institutional budget utilized</span>
          </div>
        </div>

        <div>
          <div className="text-xs text-neutral-400">Uncommitted Balance</div>
          <div className="text-2xl font-extrabold text-yellow-300 mt-1">
            ${(totalAllocated - totalSpent).toLocaleString()}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Available for remaining two quarters</div>
        </div>
      </div>

      {/* Department Selector Tabs */}
      <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 overflow-x-auto">
        {budgets.map((budget) => (
          <button
            key={budget.id}
            onClick={() => setSelectedDeptId(budget.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeBudget.id === budget.id
                ? 'bg-yellow-400 text-neutral-950 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {budget.departmentName}
          </button>
        ))}
      </div>

      {/* Department Active Details */}
      {activeBudget && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Spend vs Allocated Breakdown */}
          <div className="lg:col-span-2 bg-neutral-900 rounded-xl border border-neutral-800 p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{activeBudget.departmentName}</h3>
                <span className="text-xs text-neutral-400">Fiscal Period: {activeBudget.fiscalYear}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-yellow-400">
                  ${activeBudget.spent.toLocaleString()} / ${activeBudget.totalAllocated.toLocaleString()}
                </span>
                <div className="text-[11px] text-neutral-500">
                  {Math.round((activeBudget.spent / activeBudget.totalAllocated) * 100)}% consumed
                </div>
              </div>
            </div>

            {/* Category Breakdown Progress Bars */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Departmental Budget Lines
              </h4>

              {activeBudget.categories.map((cat) => {
                const pct = Math.round((cat.spent / cat.allocated) * 100);
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-neutral-200">{cat.name}</span>
                      <span className="text-neutral-400">
                        ${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-400' : 'bg-yellow-400'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Recent Expenses Log */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Expense Audit Trail</span>
              <span className="text-xs font-normal text-yellow-400">Audited</span>
            </h3>

            <div className="divide-y divide-neutral-800 text-xs">
              {activeBudget.recentExpenses.length === 0 ? (
                <div className="py-8 text-center text-neutral-500">No recent transactions recorded.</div>
              ) : (
                activeBudget.recentExpenses.map((exp) => (
                  <div key={exp.id} className="py-3 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-neutral-200 line-clamp-1">{exp.description}</span>
                      <span className="text-yellow-400 font-mono font-bold">
                        -${exp.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-neutral-400">
                      <span>{exp.category}</span>
                      <span>{exp.date}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500">Approved by: {exp.approvedBy}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-xl max-w-md w-full p-5 border border-neutral-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Record Departmental Procurement</h3>
            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Item Description</label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="e.g., Replacement 4K Laser Lens"
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  min="1"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="e.g., 2400"
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Budget Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="Laboratory Hardware & GPUs">Laboratory Hardware & GPUs</option>
                  <option value="Software Subscriptions & Cloud">Software Subscriptions & Cloud</option>
                  <option value="Classroom Audio-Visual Maintenance">Classroom Audio-Visual Maintenance</option>
                  <option value="Faculty Conference & Materials">Faculty Conference & Materials</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold rounded-lg shadow-sm shadow-yellow-500/20"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
