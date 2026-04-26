import { useState } from 'react';
import { useAppStore } from '@/store/AppContext';
import { Users, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export const PeopleManager = () => {
  const { persons, addPerson, removePerson } = useAppStore();
  const [val, setVal] = useState('');

  const handleAdd = () => {
    if (val.trim()) {
      addPerson(val.trim());
      setVal('');
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Group Members
        </CardTitle>
        <CardDescription>
          Add people to your group to assign them to shopping items.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="Name (e.g. John)"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button 
            onClick={handleAdd}
            disabled={!val.trim()}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {persons.map(p => (
            <Badge 
              key={p} 
              variant="secondary"
              className="px-3 py-1.5 h-9 text-sm font-medium flex items-center gap-2 pr-1 hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer group"
              onClick={() => removePerson(p)}
            >
              {p}
              <div className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-destructive-foreground/20">
                <X className="h-3 w-3" />
              </div>
            </Badge>
          ))}
          {persons.length === 0 && (
            <p className="text-xs text-muted-foreground italic py-2">No members added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
