import { useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Category, UnitType } from "@/types";
import { useAppStore } from "@/store/AppContext";
import { ItemCard } from "./ItemCard";
import { cn } from "@/lib/utils";
import {
  Plus,
  Check,
  Scroll,
  GripVertical,
  Edit2,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/Shared/DeleteConfirmDialog";

interface Props {
  category: Category;
}

export const CategoryColumn = ({ category }: Props) => {
  const { addItem, renameCategory, deleteCategory, copyCategoryToClipboard } =
    useAppStore();
  const [val, setVal] = useState("");
  const [selectedUnit] = useState<UnitType>("pcs");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState(category.title);

  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
    data: { type: "Category", categoryId: category.id },
  });

  const handleAdd = () => {
    if (val.trim()) {
      addItem(category.id, val.trim(), selectedUnit);
      setVal("");
    }
  };

  const handleRenameSubmit = () => {
    if (newTitle.trim()) {
      renameCategory(category.id, newTitle.trim());
      setIsRenaming(false);
    }
  };

  const confirmDelete = () => {
    deleteCategory(category.id);
  };

  const itemIds = useMemo(
    () => category.items.map((item) => item.id),
    [category.items],
  );

  return (
    <div
      className={cn(
        "flex flex-col min-w-[300px] md:min-w-[320px] max-h-[75vh] md:max-h-[calc(100vh-250px)] flex-1 shrink-0 bg-muted/30 rounded-xl border border-border/50 overflow-hidden group/col transition-shadow hover:shadow-sm",
        isOver && "ring-2 ring-primary/10",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-4 py-3 flex justify-between items-center transition-colors border-b border-border/10",
          isDeleting
            ? "bg-destructive/5"
            : isRenaming
              ? "bg-primary/5"
              : "bg-transparent",
        )}
      >
        {isRenaming ? (
          <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-top-2">
            <Input
              autoFocus
              className="h-8 flex-1 text-sm font-semibold"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setIsRenaming(false);
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleRenameSubmit}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">check</span>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 overflow-hidden">
              <h2 className="text-sm font-bold tracking-tight truncate">
                {category.title}
              </h2>
              <Badge
                variant="secondary"
                className="h-5 px-1.5 min-w-[20px] justify-center text-[10px] font-bold bg-muted/80 text-muted-foreground border-none"
              >
                {category.items.length}
              </Badge>
            </div>

            <div className="flex items-center gap-0.5">
              <div className="flex items-center opacity-0 group-hover/col:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Rename"
                  className="h-8 w-8 text-muted-foreground/50 hover:text-foreground"
                  onClick={() => setIsRenaming(true)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Copy Category"
                  className="h-8 w-8 text-muted-foreground/50 hover:text-foreground"
                  onClick={() => copyCategoryToClipboard(category.id)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete Category"
                  className="h-8 w-8 text-muted-foreground/50 hover:text-destructive"
                  onClick={() => setIsDeleting(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="h-4 w-[1px] bg-border/50 mx-1 hidden group-hover/col:block" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/50 hover:text-foreground"
              >
                <GripVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/50 hover:text-primary transition-colors"
                onClick={() => setIsAdding(!isAdding)}
              >
                <span className="sr-only">Add Item</span>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Items Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col p-3 gap-1.5 min-h-[150px] overflow-y-auto transition-colors",
          isOver && "bg-primary/5",
        )}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {category.items.map((item) => (
            <ItemCard key={item.id} item={item} categoryId={category.id} />
          ))}
        </SortableContext>

        {category.items.length === 0 && !isOver && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground/30">
            <Scroll className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Empty
            </p>
          </div>
        )}
      </div>

      {/* Add Item Footer */}
      <div className="p-3 border-t bg-muted/20">
        <div className="flex gap-2">
          <Input
            className="h-9 flex-1 bg-background text-sm"
            placeholder="What to buy?"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={handleAdd}
            disabled={!val.trim()}
          >
            <span className="sr-only">add</span>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleting}
        onOpenChange={setIsDeleting}
        onConfirm={confirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${category.title}" and all its items? This action cannot be undone.`}
      />
    </div>
  );
};
