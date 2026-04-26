import { useState } from 'react';
import { ExpenseSummary } from '@/components/Summary/ExpenseSummary';
import { List, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SummaryView = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'people'>('products');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expense Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track spending metrics and group settlements.</p>
      </div>

      <div className="w-full">
        <div className="flex p-1 bg-muted rounded-lg mb-6 max-w-fit">
          <button
            role="button"
            onClick={() => setActiveTab('products')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === 'products' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
            Product Details
          </button>
          <button
            role="button"
            onClick={() => setActiveTab('people')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === 'people' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            Person-wise Totals
          </button>
        </div>
        
        <div className="mt-0">
          {activeTab === 'products' ? (
            <ExpenseSummary showOnly="products" />
          ) : (
            <ExpenseSummary showOnly="people" />
          )}
        </div>
      </div>
    </div>
  );
};
