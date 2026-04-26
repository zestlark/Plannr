import { PeopleManager } from '@/components/Toolbar/PeopleManager';

export const PeopleView = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">People Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage group members and their item assignments.</p>
      </div>
      
      <div className="max-w-2xl">
        <PeopleManager />
      </div>
    </div>
  );
};
