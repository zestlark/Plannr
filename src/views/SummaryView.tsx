import { useState } from 'react';
import { ExpenseSummary } from '@/components/Summary/ExpenseSummary';
import { clsx } from 'clsx';

export const SummaryView = () => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'people'>('products');

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-500 flex flex-col h-full">
      <div className="mb-6">
        <h1 className="font-h1 text-h1 text-on-surface uppercase tracking-tight">Expense Analytics</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Track spending metrics and individual settlement balances.</p>
      </div>

      {/* Internal Tabs */}
      <div className="flex p-1 bg-surface-container-low rounded-xl border border-outline-variant w-fit mb-6 shadow-sm">
        <button 
          onClick={() => setActiveSubTab('products')}
          className={clsx(
            "px-6 py-2 rounded-lg font-button text-button transition-all",
            activeSubTab === 'products' ? "bg-primary text-on-primary shadow-md" : "text-on-surface hover:bg-surface-container-high"
          )}
        >
          Product Details
        </button>
        <button 
          onClick={() => setActiveSubTab('people')}
          className={clsx(
            "px-6 py-2 rounded-lg font-button text-button transition-all",
            activeSubTab === 'people' ? "bg-primary text-on-primary shadow-md" : "text-on-surface hover:bg-surface-container-high"
          )}
        >
          Person-wise Totals
        </button>
      </div>

      <div className="flex-1 bg-surface-container-low/30 p-gutter rounded-3xl border border-outline-variant/30 overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant">
        <ExpenseSummary showOnly={activeSubTab} />
      </div>
    </div>
  );
};
