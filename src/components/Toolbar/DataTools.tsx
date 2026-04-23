import { useState } from 'react';
import { useAppStore } from '@/store/AppContext';
import { copyToClipboard } from '@/utils';

export const DataTools = () => {
  const { importData, exportData } = useAppStore();
  const [jsonVal, setJsonVal] = useState('');

  return (
    <div className="flex flex-col bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <h3 className="font-h2 text-h2 text-on-surface mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-primary">cloud_sync</span> Data Management
      </h3>
      <p className="font-body-sm text-on-surface-variant mb-6">Backup your shopping lists or restore them from a previous export.</p>

      <div className="flex gap-4 mb-6 relative">
        <textarea
          className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[120px] font-mono text-on-surface resize-y"
          placeholder='{"categories": [], ...}'
          value={jsonVal}
          onChange={e => setJsonVal(e.target.value)}
        />
        {jsonVal && (
          <button 
            className="absolute top-2 right-6 p-2 rounded-md hover:bg-surface-variant transition-colors text-on-surface-variant"
            onClick={() => copyToClipboard(jsonVal, "JSON Copied!")}
            title="Copy JSON"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button 
          className="flex flex-1 justify-center items-center gap-2 bg-surface-container border border-outline-variant text-on-surface px-4 py-2 hover:bg-surface-container-high rounded-lg font-button transition-colors shadow-sm" 
          onClick={() => setJsonVal(exportData())}
        >
          <span className="material-symbols-outlined text-[18px]">download</span> Export JSON
        </button>
        <button 
          className="flex flex-1 justify-center items-center gap-2 bg-primary text-on-primary px-4 py-2 hover:bg-primary-container hover:text-on-primary-container rounded-lg font-button transition-colors shadow-sm" 
          onClick={() => importData(jsonVal)}
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span> Restore JSON
        </button>
      </div>
    </div>
  );
};
