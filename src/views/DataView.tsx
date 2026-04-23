import { DataTools } from '@/components/Toolbar/DataTools';

export const DataView = () => {
  return (
    <div className="animate-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="font-h1 text-h1 text-on-surface uppercase tracking-tight">System Settings</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage your data portability. Export to JSON for backups or import your previous lists.</p>
      </div>
      <div className="grid gap-6">
        <div className="bg-surface-container-low/30 p-gutter rounded-3xl border border-outline-variant/30">
           <DataTools />
        </div>
        
        <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[28px]">lock</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface">Private Storage</h3>
              <p className="text-sm text-on-surface-variant max-w-md">Your data never leaves this browser. All information is stored locally for maximum privacy and performance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
