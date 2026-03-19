import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ThreadSearchProps {
  value: string;
  onChange: (value: string) => void;
  activeTags: string[];
  onTagClick: (tag: string) => void;
  availableTags: string[];
}

export function ThreadSearch({
  value,
  onChange,
  activeTags,
  onTagClick,
  availableTags,
}: ThreadSearchProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search threads by name or tags..."
          className="pl-9 rounded-lg"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-7 rounded-full"
            onClick={() => onChange('')}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Tag filter chips */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableTags.slice(0, 10).map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={`
                  ds-badge px-2.5 py-1 rounded-full border transition-colors duration-150 cursor-pointer
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  }
                `}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
