// frontend/src/components/PlayerAutocomplete.jsx

import React, { useState, useEffect } from "react";
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
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 使用 debounce 技巧，避免使用者每打一個字就發送請求
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 1) {
        setIsLoading(true);
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/player-search?name=${encodeURIComponent(searchTerm)}`);
          const data = await response.json();
          setPlayers(data);
        } catch (error) {
          console.error("Failed to fetch players", error);
          setPlayers([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setPlayers([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[250px] justify-between h-12 text-lg bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
        >
          {value || `選擇一位球員...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-slate-900 border-slate-700">
        <Command>
          <CommandInput 
            placeholder={placeholder} 
            onValueChange={setSearchTerm}
            className="placeholder:text-slate-400"
          />
          <CommandList>
            {isLoading && <CommandEmpty>搜尋中...</CommandEmpty>}
            {!isLoading && !players.length && searchTerm.length > 1 && <CommandEmpty>找不到球員。</CommandEmpty>}
            <CommandGroup>
              {players.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.name}
                  className="text-white flex items-center gap-2 cursor-pointer"
                  // 【關鍵修正】當使用者點選時，回傳完整的 player 物件
                  onSelect={() => {
                    onValueChange(player);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === player.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <img 
                    src={player.image_url || 'https://placehold.co/40x40/1e293b/e2e8f0?text=?'} 
                    alt={player.name} 
                    className="w-8 h-8 rounded-full object-cover bg-slate-700"
                  />
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
