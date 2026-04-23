import { PeopleManager } from '@/components/Toolbar/PeopleManager';

export const PeopleView = () => {
  return (
    <div className="animate-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="font-h1 text-h1 text-on-surface uppercase tracking-tight">People Management</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage people in your group. All changes here update assignments across all lists instantly.</p>
      </div>
      <div className="bg-surface-container-low/30 p-gutter rounded-3xl border border-outline-variant/30">
        <PeopleManager />
      </div>
    </div>
  );
};
