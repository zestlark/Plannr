import { useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Category, UnitType } from "@/types";
import { useAppStore } from "@/store/AppContext";
import { ItemCard } from "./ItemCard";
import { clsx } from "clsx";

interface Props {
  category: Category;
}

const UNITS: UnitType[] = ["pcs", "kg", "ltr", "pack", "gm"];

export const CategoryColumn = ({ category }: Props) => {
  const { addItem, renameCategory, deleteCategory, copyCategoryToClipboard } =
    useAppStore();
  const [val, setVal] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<UnitType>("pcs");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
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
    setIsDeleting(false);
  };

  const handleCopy = () => {
    copyCategoryToClipboard(category.id);
  };

  const itemIds = useMemo(
    () => category.items.map((item) => item.id),
    [category.items],
  );

  return (
    <div className="flex flex-col min-w-full md:min-w-[400px] max-h-[75vh] md:max-h-[calc(100vh-230px)] flex-1 shrink-0 bg-surface-container-lowest rounded-2xl shadow-bento border border-outline-variant overflow-hidden group/col">
      {/* Header */}
      <div
        className={clsx(
          "p-4 border-b border-outline-variant flex justify-between items-center backdrop-blur-sm sticky top-0 z-10 transition-all",
          isDeleting
            ? "bg-error/10"
            : isRenaming
              ? "bg-primary/5"
              : "bg-surface-container-lowest/80",
        )}
      >
        {isDeleting ? (
          <div className="flex items-center justify-between w-full animate-in fade-in slide-in-from-top-2">
            <span className="text-error font-bold text-xs uppercase tracking-tight">
              Delete Category?
            </span>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                className="bg-error text-on-error px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-error-container hover:text-on-error-container transition-all"
              >
                Confirm
              </button>
              <button
                onClick={() => setIsDeleting(false)}
                className="bg-surface-container-high text-on-surface px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-surface-container-highest transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isRenaming ? (
          <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-top-2">
            <input
              autoFocus
              className="flex-1 px-2 py-1 bg-surface-container-lowest border border-primary rounded-lg text-sm font-semibold outline-none"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setIsRenaming(false);
              }}
            />
            <button
              onClick={handleRenameSubmit}
              className="bg-primary text-on-primary p-1.5 rounded-lg"
            >
              <span className="material-symbols-outlined text-[18px]">
                check
              </span>
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/5">
                <span
                  className="material-symbols-outlined text-primary text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  inventory_2
                </span>
              </div>
              <h2 className="font-semibold text-on-surface truncate tracking-tight">
                {category.title}
              </h2>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover/col:opacity-100 transition-opacity">
              <button
                onClick={() => setIsRenaming(true)}
                className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                title="Rename"
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-success transition-colors"
                title="Copy Category"
              >
                <span className="material-symbols-outlined text-[18px]">
                  content_copy
                </span>
              </button>
              <button
                onClick={() => setIsDeleting(true)}
                className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error transition-colors"
                title="Delete Category"
              >
                <span className="material-symbols-outlined text-[18px]">
                  delete
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Items Area */}
      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 flex flex-col p-2 gap-1 min-h-[150px] overflow-y-auto transition-all relative scrollbar-thin scrollbar-thumb-outline-variant",
          isOver ? "bg-primary/5" : "",
        )}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {category.items.map((item) => (
            <ItemCard key={item.id} item={item} categoryId={category.id} />
          ))}
        </SortableContext>

        {category.items.length === 0 && !isOver && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-on-surface-variant/40">
            <span className="material-symbols-outlined text-[48px] mb-2 opacity-20">
              inventory
            </span>
            <p className="text-body-sm font-medium">No items yet</p>
          </div>
        )}

        {isOver && (
          <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-xl m-2 pointer-events-none" />
        )}
      </div>

      {/* Add Item Footer */}
      <div className="p-3 border-t border-outline-variant bg-surface-container-low/50">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="What to buy?"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:grayscale"
              onClick={handleAdd}
              disabled={!val.trim()}
            >
              <span className="material-symbols-outlined text-[24px]">add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
