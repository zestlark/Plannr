import { useAppStore } from '@/store/AppContext';
import { useMemo } from 'react';
import { Item } from '@/types';
import { generateWhatsAppSummary, copyToClipboard } from '@/utils';

interface ExpenseSummaryProps {
  showOnly?: 'products' | 'people';
}

export const ExpenseSummary = ({ showOnly }: ExpenseSummaryProps) => {
  const { categories } = useAppStore();

  const handleCopySummary = () => {
    const text = generateWhatsAppSummary(categories);
    copyToClipboard(text, 'Full Summary Copied!');
  };

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

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center text-on-surface-variant/40">
        <span className="material-symbols-outlined text-[64px] mb-4 opacity-10">receipt_long</span>
        <h3 className="font-h2 text-h2 mb-2">No Expenses Yet</h3>
        <p className="max-w-xs">Add items with prices in the Dashboard to see your summary reports here.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-container-lowest p-6 rounded-xl border border-outline-variant transition-colors relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-h2 text-h2 text-on-surface">Calculated Metrics</h2>
        <button 
          onClick={handleCopySummary}
          className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 hover:shadow-md transition-all font-button active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">content_copy</span>
          Copy WhatsApp List
        </button>
      </div>
      
      {(!showOnly || showOnly === 'products') && (
        <div className="overflow-x-auto mb-8 animate-in fade-in duration-300">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Product</th>
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider border-b border-outline-variant text-right">Price</th>
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider border-b border-outline-variant text-center">Qty</th>
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Person</th>
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider border-b border-outline-variant text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {itemsList.map(item => (
                <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-medium text-on-surface block">{item.name}</span>
                    <span className="text-[11px] uppercase font-bold text-primary/50 tracking-widest">{item.categoryName}</span>
                  </td>
                  <td className="py-4 px-4 text-right font-body-md text-on-surface-variant">₹{Number(item.price || 0).toLocaleString()}</td>
                  <td className="py-4 px-4 text-center font-body-md text-on-surface-variant font-bold">{item.qty} <span className="text-[10px] opacity-60 uppercase">{item.unit}</span></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                       <span className="text-on-surface font-medium whitespace-nowrap">{item.person || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-body-md font-black text-on-surface">₹{Number(item.total || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(!showOnly || showOnly === 'people') && (
        <div className="animate-in fade-in duration-300">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(personTotals).map(([person, total]) => (
              <div key={person} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-[11px] font-black uppercase text-on-surface-variant/40 tracking-widest mb-1">Person</p>
                  <h4 className="font-bold text-on-surface">{person}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black uppercase text-primary/40 tracking-widest mb-1">Total</p>
                  <p className="font-h2 text-primary font-black">₹{Number(total).toLocaleString()}</p>
                </div>
              </div>
            ))}
            
            <div className="bg-primary/5 p-5 rounded-2xl border-2 border-primary/20 flex justify-between items-center shadow-lg lg:col-span-1 shadow-primary/5">
              <div>
                <p className="text-[11px] font-black uppercase text-primary/60 tracking-widest mb-1 font-bold">Group Grand Total</p>
                <h4 className="font-h2 text-primary font-black text-2xl tracking-tighter">₹{Number(grandTotal).toLocaleString()}</h4>
              </div>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[28px]">payments</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
