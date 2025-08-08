// src/components/PlayerAutocomplete.jsx
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PlayerAutocomplete({ value, onValueChange, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsLoading(true);
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/player-search?name=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();
          setSearchResults(data);
        } catch (error) {
          console.error("Failed to fetch players", error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          // 【修正處】在這裡加入了 text-white，確保文字永遠是白色的
          className="w-full sm:w-[250px] justify-between h-12 text-lg bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
        >
          {value || `選擇一位球員...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 bg-slate-900 border-slate-700">
        <Command>
          <CommandInput 
            placeholder={placeholder} 
            onValueChange={setSearchQuery}
            className="placeholder:text-slate-400"
          />
          <CommandList>
            {isLoading && <CommandEmpty>搜尋中...</CommandEmpty>}
            {!isLoading && !searchResults.length && searchQuery.length > 1 && <CommandEmpty>找不到球員。</CommandEmpty>}
            <CommandGroup>
              {searchResults.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.name}
                  className="text-white flex items-center gap-2"
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === player.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {player.image_url ? (
                    <img src={player.image_url} alt={player.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                  )}
                  <span>{player.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}