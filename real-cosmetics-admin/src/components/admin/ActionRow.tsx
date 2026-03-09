import React from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface ActionRowProps {
  children?: React.ReactNode;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function ActionRow({ children, onSearch, searchPlaceholder = "Search...", className }: ActionRowProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      {onSearch && (
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}
      <div className="flex items-center gap-2 ml-auto">
        {children}
      </div>
    </div>
  );
}
