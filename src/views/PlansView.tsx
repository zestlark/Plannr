import { useAppStore } from '@/store/AppContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Calendar,
  Layout,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DeleteConfirmDialog } from '@/components/Shared/DeleteConfirmDialog';

export const PlansView = () => {
  const { plans, addPlan, deletePlan, setCurrentPlanId, renamePlan, initialLoading } = useAppStore();
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!newPlanTitle.trim()) return;
    const plan = await addPlan(newPlanTitle);
    if (plan) {
      setNewPlanTitle('');
      setIsCreating(false);
      handleSelectPlan(plan.id);
    }
  };

  const handleSelectPlan = (id: string) => {
    if (editingId) return;
    setCurrentPlanId(id);
    navigate(`/p/${id}`);
  };

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      renamePlan(id, editTitle);
    }
    setEditingId(null);
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[100]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Plans</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your villa trips and shopping organizers.</p>
        </div>
        
        {!isCreating ? (
          <Button 
            onClick={() => setIsCreating(true)}
            size="lg"
            className="h-11 px-6 shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Plan
          </Button>
        ) : (
          <div className="flex gap-2 w-full md:w-auto animate-in slide-in-from-right-4">
            <Input 
              autoFocus
              className="md:w-72 h-11"
              placeholder="Summer Villa 2024..."
              value={newPlanTitle}
              onChange={e => setNewPlanTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <Button className="h-11 w-11 p-0" onClick={handleCreate}>
              <Check className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="h-11 w-11 p-0" onClick={() => setIsCreating(false)}>
              <span className="sr-only">close</span>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <Card className="col-span-full border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Layout className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No plans yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                Create your first plan to start organizing your villa shopping lists.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          plans.map(plan => (
            <Card 
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className="group relative hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden border-border/60"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    {editingId === plan.id ? (
                      <div onClick={e => e.stopPropagation()} className="mb-2">
                        <Input 
                          autoFocus
                          className="h-8 text-lg font-bold"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRename(plan.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onBlur={() => handleRename(plan.id)}
                        />
                      </div>
                    ) : (
                      <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                        {plan.title}
                      </CardTitle>
                    )}
                    <CardDescription className="font-mono text-[10px] uppercase tracking-wider">
                      ID: {plan.id.slice(0, 8)}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2" onClick={e => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Rename Plan"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(plan.id);
                        setEditTitle(plan.title);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlanToDelete(plan.id);
                      }}
                    >
                      <span className="sr-only">delete</span>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Separator className="mb-4 opacity-50" />
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                    <Calendar className="h-3 w-3" />
                    {new Date(plan.created_at).toLocaleDateString()}
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-bold h-5 px-1.5 bg-primary/5 text-primary border-none">
                    ACTIVE
                  </Badge>
                </div>
              </CardContent>
              
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Card>
          ))
        )}
      </div>
      <DeleteConfirmDialog 
        isOpen={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
        onConfirm={() => {
          if (planToDelete) {
            deletePlan(planToDelete);
            setPlanToDelete(null);
          }
        }}
        title="Delete this entire plan?"
      />
    </div>
  );
};
