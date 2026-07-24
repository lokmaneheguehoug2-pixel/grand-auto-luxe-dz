import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRANDS } from "@/lib/wilayas";

type BrandComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function BrandCombobox({ value, onChange, className }: BrandComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-charcoal border-gold/30 hover:border-gold/60 font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          {value || "Select brand…"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-0 bg-charcoal border-gold/30" align="start">
        <Command>
          <CommandInput placeholder="Search 200 brands…" className="h-9" />
          <CommandList className="max-h-[280px]">
            <CommandEmpty>No brand found.</CommandEmpty>
            <CommandGroup>
              {BRANDS.map((brand) => (
                <CommandItem
                  key={brand}
                  value={brand}
                  onSelect={() => {
                    onChange(brand === value ? "" : brand);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === brand ? "opacity-100 text-gold" : "opacity-0",
                    )}
                  />
                  {brand}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
