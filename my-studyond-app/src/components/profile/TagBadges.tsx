import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface TagBadgesProps {
  tags: string[];
  onRemove?: (tag: string) => void;
  isLoading?: boolean;
}

export function TagBadges({ tags, onRemove, isLoading }: TagBadgesProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-ai-solid animate-pulse" />
        <span className="ds-small text-muted-foreground">Generating tags...</span>
        <div className="flex gap-1.5">
          {[60, 80, 50, 90, 70].map((w, i) => (
            <div
              key={i}
              className="h-6 rounded-full bg-muted animate-pulse"
              style={{ width: `${w}px`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="size-4" />
        <span className="ds-small">Save your profile to generate AI tags</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence mode="popLayout">
        {tags.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            className="group inline-flex items-center gap-1 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 text-transparent bg-gradient-to-r from-purple-500 via-blue-600 to-blue-500 bg-clip-text font-medium text-xs cursor-default"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
              backgroundClip: 'unset',
            }}
          >
            <span className="text-ai text-xs font-medium">{tag}</span>
            {onRemove && (
              <button
                onClick={() => onRemove(tag)}
                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                <X className="size-3 text-blue-500" />
              </button>
            )}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
