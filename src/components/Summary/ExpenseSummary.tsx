import { useAppStore } from '@/store/AppContext';
import { useMemo } from 'react';
import { Item } from '@/types';

export const ExpenseSummary = () => {
  const { categories } = useAppStore();

  const { totalItems, personTotals, grandTotal, itemsList } = useMemo(() => {
    let itemsList: (Item & {categoryName: string, total: number})[] = [];
    let personTotals: Record<string, number> = {};
    let grandTotal = 0;

    categories.forEach(cat => {
      cat.items.forEach(item => {
        const t = (item.price || 0) * (item.qty || 0);
        const person = item.person || 'Unassigned';
        
        personTotals[person] = (personTotals[person] || 0) + t;
        grandTotal += t;
        
        itemsList.push({
          ...item,
          categoryName: cat.title,
          total: t
        });
      });
    });

    return { totalItems: itemsList.length, personTotals, grandTotal, itemsList };
  }, [categories]);

  if (totalItems === 0) return null;

  return (
    <div className="mt-10 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <span className="text-xl">📊</span> Shopping & Payment Summary
      </h2>
      
      <div className="overflow-x-auto mb-8">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead>
            <tr>
              <th className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Product</th>
              <th className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Price/Unit</th>
              <th className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Qty</th>
              <th className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Assigned To</th>
              <th className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {itemsList.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs ml-2">({item.categoryName})</span>
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">₹{Number(item.price || 0).toFixed(2)}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.qty} {item.unit}</td>
                <td className="py-3 px-4">
                  <span className="inline-block bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 py-1 px-3 rounded-full text-xs font-medium">
                    {item.person || 'Unassigned'}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">₹{Number(item.total || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-md font-semibold mb-4 text-slate-800 dark:text-slate-100 mt-6 flex items-center gap-2">
        <span className="text-xl">💰</span> Total to Pay by Person
      </h3>
      <div className="overflow-x-auto max-w-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Person</th>
              <th className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Amount to Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {Object.entries(personTotals).map(([person, total]) => (
              <tr key={person}>
                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{person}</td>
                <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">₹{Number(total).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 dark:bg-slate-900/50 font-bold border-t-2 border-slate-300 dark:border-slate-600">
              <td className="py-4 px-4 text-slate-800 dark:text-slate-100">Grand Total</td>
              <td className="py-4 px-4 text-slate-800 dark:text-slate-100 text-lg">₹{Number(grandTotal).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
