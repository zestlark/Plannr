import { useAppStore } from '@/store/AppContext';
import { Board } from '@/components/Board/Board';
import { useState } from 'react';
import { PeopleFilter } from '@/components/Toolbar/PeopleFilter';
import { 
  Plus, 
  ArrowUpDown,
  Check, 
  Loader2,
  Search,
  X,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteConfirmDialog } from '@/components/Shared/DeleteConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface DashboardViewProps {
  searchQuery: string;
}

export const DashboardView = ({ searchQuery }: DashboardViewProps) => {
  const { addCategory, sortAllItems, loading, initialLoading, activePlan, deletePlan, persons, addPerson, removePerson } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [showPeopleDialog, setShowPeopleDialog] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [selectedPersons, setSelectedPersons] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium text-sm">Syncing with database...</p>
      </div>
    );
  }

  const handleAdd = () => {
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8">
      {loading && !initialLoading && (
        <div className="fixed bottom-6 right-6 bg-card border border-border px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 z-50">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Syncing...</span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground/90">{activePlan?.title || 'Kanban Board'}</h1>
              {/* <p className="text-sm text-muted-foreground mt-1">Manage your villa shopping categories and items.</p> */}
            </div>
            {activePlan && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive transition-colors mt-1"
                title="Delete Plan"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
             <div className="flex -space-x-3 mr-2">
                {persons.slice(0, 3).map((name, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center border-2 border-background text-primary-foreground shadow-sm uppercase">
                    {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                ))}
                {persons.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-muted text-[10px] font-bold flex items-center justify-center border-2 border-background text-muted-foreground shadow-sm">
                    +{persons.length - 3}
                  </div>
                )}
             </div>
             <Button 
                variant="outline" 
                size="sm" 
                className="h-9 font-semibold gap-2 border-dashed"
                onClick={() => setShowPeopleDialog(true)}
             >
                <Plus className="h-4 w-4" />
                Add Assignee
             </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border w-fit">
            <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-bold bg-background shadow-sm hover:bg-background">Board</Button>
            <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-bold text-muted-foreground hover:text-foreground">List</Button>
            <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-bold text-muted-foreground hover:text-foreground">Table</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input className="h-9 w-48 pl-8 text-xs bg-muted/20 border-none" placeholder="Search tasks..." />
            </div>
            
            <PeopleFilter 
              selectedPersons={selectedPersons} 
              onChange={setSelectedPersons} 
            />

            <Button variant="outline" size="icon" className="h-9 w-9 text-muted-foreground" onClick={sortAllItems}>
              <span className="sr-only">Sort</span>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            
            {isAdding ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                 <Input 
                  autoFocus
                  className="h-9 w-40"
                  placeholder="Category name..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') setIsAdding(false);
                  }}
                />
                <Button size="icon" className="h-9 w-9" onClick={handleAdd}>
                  <Check className="h-4 w-4" />
                  <span className="sr-only">check</span>
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setIsAdding(false)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">close</span>
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setIsAdding(true)}
                className="h-9 px-4 font-bold bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <Board searchQuery={searchQuery} peopleFilter={selectedPersons} />
      
      <DeleteConfirmDialog 
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => {
          if (activePlan) {
            deletePlan(activePlan.id);
            setShowDeleteConfirm(false);
          }
        }}
        title="Delete this entire plan?"
      />

      <Dialog open={showPeopleDialog} onOpenChange={setShowPeopleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Assignees</DialogTitle>
            <DialogDescription>
              Add or remove people from this plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Name..." 
                value={newPersonName}
                onChange={e => setNewPersonName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    addPerson(newPersonName);
                    setNewPersonName('');
                  }
                }}
              />
              <Button onClick={() => {
                addPerson(newPersonName);
                setNewPersonName('');
              }}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {persons.map(name => (
                <Badge key={name} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
                  {name}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
                    onClick={() => removePerson(name)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {persons.length === 0 && (
                <p className="text-sm text-muted-foreground italic py-2">No assignees yet.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
