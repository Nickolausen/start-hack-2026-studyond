import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThreadItem } from './ThreadItem';
import { ThreadSearch } from './ThreadSearch';
import { useAppStore } from '@/store/useAppStore';

export function ThreadInbox() {
  const { savedThreads, committedThreadId } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Collect all unique tags from saved threads
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    savedThreads.forEach((t) => t.card.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [savedThreads]);

  // Filter threads
  const filteredThreads = useMemo(() => {
    let threads = [...savedThreads];

    // Pin committed thread to top
    const committedIndex = threads.findIndex((t) => t.id === committedThreadId);
    if (committedIndex > 0) {
      const [committed] = threads.splice(committedIndex, 1);
      threads.unshift(committed);
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      threads = threads.filter(
        (t) =>
          t.card.name.toLowerCase().includes(q) ||
          t.card.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          (t.card.topicTitle?.toLowerCase().includes(q) ?? false) ||
          t.card.description.toLowerCase().includes(q)
      );
    }

    // Apply tag filter
    if (activeTags.length > 0) {
      threads = threads.filter((t) =>
        activeTags.every((activeTag) => t.card.tags.includes(activeTag))
      );
    }

    return threads;
  }, [savedThreads, committedThreadId, searchQuery, activeTags]);

  const handleTagClick = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (savedThreads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <MessageCircle className="size-7 text-muted-foreground" />
        </div>
        <h3 className="ds-title-sm mb-2 text-foreground">No saved threads yet</h3>
        <p className="ds-body text-muted-foreground max-w-sm mb-6">
          Like a match in the AI Advisor to save it here. Each saved match becomes a dedicated chat thread.
        </p>
        <Link to="/chat">
          <Button className="bg-ai rounded-full gap-2 ai-pulse">
            <Sparkles className="size-4" />
            Find Matches
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ThreadSearch
        value={searchQuery}
        onChange={setSearchQuery}
        activeTags={activeTags}
        onTagClick={handleTagClick}
        availableTags={availableTags}
      />

      <AnimatePresence mode="popLayout">
        {filteredThreads.length > 0 ? (
          <div className="space-y-2">
            {filteredThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isCommitted={thread.id === committedThreadId}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 text-muted-foreground"
          >
            <p className="ds-body">No threads match your search.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
