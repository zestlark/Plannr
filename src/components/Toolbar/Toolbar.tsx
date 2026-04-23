import { PeopleManager } from './PeopleManager';
import { CategoryManager } from './CategoryManager';
import { DataTools } from './DataTools';

export const Toolbar = () => {
  return (
    <div className="flex flex-wrap gap-6 mb-8 w-full">
      <PeopleManager />
      <CategoryManager />
      <DataTools />
    </div>
  );
};
