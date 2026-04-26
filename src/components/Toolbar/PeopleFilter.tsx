import { useState } from "react";
import { useAppStore } from "@/store/AppContext";
import { Check, Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PeopleFilterProps {
  selectedPersons: string[];
  onChange: (persons: string[]) => void;
}

export const PeopleFilter = ({
  selectedPersons,
  onChange,
}: PeopleFilterProps) => {
  const { persons } = useAppStore();
  const [open, setOpen] = useState(false);

  const togglePerson = (name: string) => {
    if (selectedPersons.includes(name)) {
      onChange(selectedPersons.filter((p) => p !== name));
    } else {
      onChange([...selectedPersons, name]);
    }
  };

  const clearFilters = () => {
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-dashed flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          <span>People</span>
          {selectedPersons.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedPersons.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedPersons.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedPersons.length} selected
                  </Badge>
                ) : (
                  selectedPersons.map((option) => (
                    <Badge
                      variant="secondary"
                      key={option || "unassigned"}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option || "Unassigned"}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
          <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Filter people..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => togglePerson("")}
                className="cursor-pointer"
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    selectedPersons.includes("")
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible",
                  )}
                >
                  <Check className="h-3 w-3" />
                </div>
                <span>Unassigned</span>
              </CommandItem>
              {persons.map((person) => {
                const isSelected = selectedPersons.includes(person);
                return (
                  <CommandItem
                    key={person}
                    onSelect={() => togglePerson(person)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="truncate">{person}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedPersons.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearFilters}
                    className="justify-center text-center font-medium text-destructive hover:text-destructive cursor-pointer"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
