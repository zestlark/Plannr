import { useState } from 'react';
import { useAppStore } from '@/store/AppContext';
import { copyToClipboard } from '@/utils';
import { Database, Download, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export const DataTools = () => {
  const { importData, exportData } = useAppStore();
  const [jsonVal, setJsonVal] = useState('');

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Data Portability
        </CardTitle>
        <CardDescription>
          Backup your shopping lists or restore them from a previous export.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="relative group">
          <Textarea
            className="min-h-[120px] font-mono text-xs p-4 bg-muted/30 focus-visible:ring-1"
            placeholder='{"categories": [], ...}'
            value={jsonVal}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJsonVal(e.target.value)}
          />
          {jsonVal && (
            <Button 
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyToClipboard(jsonVal, "JSON Copied!")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="flex-1 h-10"
            onClick={() => setJsonVal(exportData())}
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button 
            className="flex-1 h-10"
            onClick={() => importData(jsonVal)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Restore Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
