import { Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeActionsProps {
  onLike: () => void;
  onPass: () => void;
  disabled?: boolean;
  currentIndex: number;
  total: number;
}

export function SwipeActions({
  onLike,
  onPass,
  disabled,
  currentIndex,
  total,
}: SwipeActionsProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Counter */}
      <p className="ds-caption text-muted-foreground">
        {currentIndex + 1} of {total} matches
      </p>

      {/* Dot indicators */}
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'size-2 bg-primary'
                : i < currentIndex
                ? 'size-1.5 bg-emerald-400'
                : 'size-1.5 bg-border'
            }`}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          className="size-14 rounded-full border-2 border-red-200 text-red-400 hover:bg-red-50 hover:border-red-400 hover:text-red-500 dark:border-red-900 dark:hover:bg-red-950/30 transition-all duration-150 shadow-sm"
          onClick={onPass}
          disabled={disabled}
          aria-label="Pass"
        >
          <X className="size-6" strokeWidth={2.5} />
        </Button>

        <Button
          className="size-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-150"
          size="icon"
          onClick={onLike}
          disabled={disabled}
          aria-label="Like"
        >
          <Heart className="size-6 fill-white" />
        </Button>
      </div>

      <p className="ds-caption text-muted-foreground text-center">
        Swipe or use buttons · Like saves to your inbox
      </p>
    </div>
  );
}
