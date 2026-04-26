import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Item, UnitType } from "@/types";
import { useAppStore } from "@/store/AppContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus, Minus, UserPlus, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/Shared/DeleteConfirmDialog";

interface Props {
  item: Item;
  categoryId: string;
}

const UNITS: UnitType[] = ["pcs", "kg", "ltr", "pack", "gm"];

export const ItemCard = ({ item, categoryId }: Props) => {
  const { deleteItem, updateItem, persons } = useAppStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQty, setEditQty] = useState(item.qty.toString());
  const [editPrice, setEditPrice] = useState(
    item.price ? item.price.toString() : "",
  );
  const [editTotal, setEditTotal] = useState(
    item.qty * (item.price || 0)
      ? (item.qty * (item.price || 0)).toString()
      : "",
  );

  useEffect(() => {
    setEditName(item.name);
  }, [item.name]);

  useEffect(() => {
    setEditQty(item.qty.toString());
  }, [item.qty]);

  useEffect(() => {
    setEditPrice(item.price ? item.price.toString() : "");
  }, [item.price]);

  useEffect(() => {
    const total = item.qty * (item.price || 0);
    setEditTotal(total ? total.toString() : "");
  }, [item.qty, item.price]);

  // Debounced Price Sync
  useEffect(() => {
    const val = Number(editPrice);
    if (!isNaN(val) && val !== item.price) {
      const timer = setTimeout(() => {
        updateItem(categoryId, item.id, { price: val });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [editPrice, categoryId, item.id, item.price]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: "Item", item, categoryId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleUpdateQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    const step = ["kg", "ltr", "gm"].includes(item.unit) ? 0.5 : 1;
    const newVal = Math.max(0, item.qty + delta * step);
    updateItem(categoryId, item.id, { qty: newVal });
  };

  const handleManualQtySave = () => {
    const val = parseFloat(editQty);
    if (!isNaN(val)) {
      updateItem(categoryId, item.id, { qty: Math.max(0, val) });
    }
    setIsEditingQty(false);
  };

  const saveName = () => {
    if (editName.trim()) {
      updateItem(categoryId, item.id, { name: editName.trim() });
    }
    setIsEditingName(false);
  };

  const handlePersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateItem(categoryId, item.id, { person: e.target.value });
  };

  const handleTotalChange = (val: string) => {
    setEditTotal(val);
    const total = parseFloat(val);
    if (!isNaN(total) && item.qty > 0) {
      const perPiece = total / item.qty;
      const formatted = parseFloat(perPiece.toFixed(2));
      setEditPrice(formatted ? formatted.toString() : "");
    } else if (val === "") {
      setEditPrice("");
    }
  };

  const setUnit = (u: UnitType) => {
    updateItem(categoryId, item.id, { unit: u });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group/item bg-card p-4 rounded-xl transition-all duration-200 flex flex-col gap-4 relative border border-border/50 shadow-sm cursor-grab active:cursor-grabbing",
        isDragging
          ? "shadow-lg ring-1 ring-primary border-primary"
          : "hover:shadow-md hover:border-primary/20",
      )}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          {isEditingName ? (
            <Input
              autoFocus
              className="h-7 py-0 px-2 text-sm font-bold border-none bg-muted/50 focus-visible:ring-0"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
            />
          ) : (
            <h3
              className="text-[15px] font-bold tracking-tight leading-tight cursor-pointer hover:text-primary transition-colors truncate"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingName(true);
              }}
            >
              {item.name}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative group/total">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] opacity-50 font-bold text-primary">₹</span>
            <input 
              type="number"
              data-testid="total-input"
              value={editTotal}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => handleTotalChange(e.target.value)}
              className="text-sm font-black text-primary bg-primary/5 pl-5 pr-2 py-0.5 rounded-full border border-primary/10 transition-all w-20 focus:w-24 focus:bg-primary/10 focus:border-primary/30 outline-none hide-arrows text-right"
              placeholder="0"
            />
          </div>

          {/* Hover Actions */}
          <div className="flex gap-0.5 w-0 group-hover/item:w-auto overflow-hidden transition-all duration-300 opacity-0 group-hover/item:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              onPointerDown={(e) => e.stopPropagation()}
              className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Delete Item"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 border-background transition-all shadow-sm overflow-hidden",
                item.person
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground/40 hover:bg-muted/80",
              )}
            >
              {item.person ? (
                <span className="text-[10px] font-bold uppercase">
                  {item.person.slice(0, 2)}
                </span>
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </div>
            <select
              value={item.person || ""}
              title={item.person || "Unassigned"}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={handlePersonChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
            >
              <option value="">Unassigned</option>
              {persons.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-muted/40 px-2 h-7 rounded-md border border-border/50">
            <span className="text-[10px] text-muted-foreground font-bold mr-1.5 uppercase">
              Rate
            </span>
            <span className="text-[10px] text-muted-foreground font-bold mr-1">
              ₹
            </span>
            <input
              type="number"
              data-testid="price-input"
              value={editPrice}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-12 bg-transparent outline-none text-xs font-bold hide-arrows"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex items-center bg-muted/50 rounded-lg border p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => handleUpdateQty(e, -1)}
          >
            <span className="sr-only">remove</span>
            <Minus className="h-3 w-3" />
          </Button>

          {isEditingQty ? (
            <Input
              autoFocus
              className="h-6 w-10 p-0 text-center text-xs font-black bg-background border-none focus-visible:ring-0"
              value={editQty}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => setEditQty(e.target.value)}
              onBlur={handleManualQtySave}
              onKeyDown={(e) => e.key === "Enter" && handleManualQtySave()}
            />
          ) : (
            <span
              className="text-xs font-black px-2.5 min-w-[30px] text-center cursor-pointer hover:bg-muted transition-colors rounded"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingQty(true);
              }}
            >
              {item.qty}
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => handleUpdateQty(e, 1)}
          >
            <span className="sr-only">add</span>
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="relative">
          <select
            className="h-6 px-2 text-[10px] font-black border-none bg-muted/50 text-muted-foreground/70 uppercase tracking-tighter rounded-full appearance-none cursor-pointer outline-none"
            value={item.unit}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => setUnit(e.target.value as UnitType)}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => deleteItem(categoryId, item.id)}
        title="Delete Item"
        description={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
      />
    </div>
  );
};
