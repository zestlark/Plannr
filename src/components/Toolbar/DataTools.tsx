import { useState } from 'react';
import { useAppStore } from '@/store/AppContext';
import { Settings, ArrowDownAZ, Upload, Download, Copy, Moon, Sun } from 'lucide-react';
import { copyToClipboard } from '@/utils';

export const DataTools = () => {
  const { sortAllItems, importData, exportData } = useAppStore();
  const [jsonVal, setJsonVal] = useState('');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <div className="flex flex-col flex-1 min-w-[280px] bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Settings size={16} /> Data & Tools
        </h3>
        <button onClick={toggleDark} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button className="btn btn-info flex-1" onClick={sortAllItems}>
          <ArrowDownAZ size={16} /> Sort A-Z
        </button>
        <button className="btn btn-warning flex-1" onClick={() => setJsonVal(exportData())}>
          <Download size={16} /> Export
        </button>
        <button className="btn btn-danger flex-1" onClick={() => importData(jsonVal)}>
          <Upload size={16} /> Import
        </button>
      </div>
      
      <div className="relative">
        <textarea
          className="input-focus w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg transition-all resize-y min-h-[60px]"
          placeholder="JSON Export/Import data will appear here..."
          value={jsonVal}
          onChange={e => setJsonVal(e.target.value)}
        />
        {jsonVal && (
          <button 
            className="absolute top-2 right-2 bg-slate-200 dark:bg-slate-700 p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            onClick={() => copyToClipboard(jsonVal, "JSON Copied!")}
            title="Copy JSON"
          >
            <Copy size={12} className="text-slate-600 dark:text-slate-300" />
          </button>
        )}
      </div>
    </div>
  );
};
