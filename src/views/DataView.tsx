import { DataTools } from '@/components/Toolbar/DataTools';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const DataView = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your data portability and backup your plans.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <DataTools />
        
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Supabase Cloud Sync</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Your data is automatically synced with Supabase. Access your villa plans securely from any device in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
