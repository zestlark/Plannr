import { useAppStore } from '@/store/AppContext';
import { useMemo } from 'react';
import { Item } from '@/types';
import { generateWhatsAppSummary, copyToClipboard } from '@/utils';
import { 
  Copy, 
  Receipt, 
  TrendingUp,
  User,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ExpenseSummaryProps {
  showOnly?: 'products' | 'people';
}

export const ExpenseSummary = ({ showOnly }: ExpenseSummaryProps) => {
  const { categories } = useAppStore();

  const handleCopySummary = () => {
    const text = generateWhatsAppSummary(categories);
    copyToClipboard(text, 'Full Summary Copied!');
  };

  const { totalItems, personTotals, grandTotal, itemsList } = useMemo(() => {
    let itemsList: (Item & {categoryName: string, total: number})[] = [];
    let personTotals: Record<string, number> = {};
    let grandTotal = 0;

    categories.forEach(cat => {
      cat.items.forEach(item => {
        const t = (item.price || 0) * (item.qty || 0);
        const person = item.person || 'Unassigned';
        
        personTotals[person] = (personTotals[person] || 0) + t;
        grandTotal += t;
        
        itemsList.push({
          ...item,
          categoryName: cat.title,
          total: t
        });
      });
    });

    return { totalItems: itemsList.length, personTotals, grandTotal, itemsList };
  }, [categories]);

  if (totalItems === 0) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No Expenses Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
            Add items with prices in the Dashboard to see your summary reports here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Expense Overview</h2>
        <Button 
          onClick={handleCopySummary}
          variant="secondary"
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none h-9"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy WhatsApp Summary
        </Button>
      </div>
      
      {(!showOnly || showOnly === 'products') && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Itemized Expenses
            </CardTitle>
            <CardDescription>Detailed breakdown of all items across categories.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsList.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.categoryName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">₹{Number(item.price || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-center font-bold text-sm">
                        {item.qty} <span className="text-[10px] text-muted-foreground uppercase">{item.unit}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          <User className="h-3 w-3 mr-1 opacity-50" />
                          {item.person || 'Unassigned'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm">₹{Number(item.total || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {(!showOnly || showOnly === 'people') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary text-primary-foreground shadow-lg border-none md:col-span-1">
              <CardHeader className="pb-2">
                <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[10px] tracking-widest">Grand Total</CardDescription>
                <CardTitle className="text-3xl font-black tracking-tighter">₹{Number(grandTotal).toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-[11px] font-medium opacity-80">
                  <TrendingUp className="h-3 w-3" />
                  Total combined expenses
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(personTotals).map(([person, total]) => (
                <Card key={person} className="shadow-sm border-border/50">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="uppercase text-[9px] font-black tracking-widest">Individual Total</CardDescription>
                    <div className="flex justify-between items-center mt-1">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                        {person}
                      </CardTitle>
                      <span className="text-lg font-black text-primary">₹{Number(total).toLocaleString()}</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
