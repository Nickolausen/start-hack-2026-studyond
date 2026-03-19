import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, PinOff, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

interface CommitButtonProps {
  threadId: string;
}

export function CommitButton({ threadId }: CommitButtonProps) {
  const { committedThreadId, commitToThread, uncommitThread } = useAppStore();
  const isCommitted = committedThreadId === threadId;
  const isOtherCommitted = committedThreadId !== null && committedThreadId !== threadId;
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (isCommitted) {
      uncommitThread();
      return;
    }
    if (isOtherCommitted) {
      setShowConfirm(true);
      return;
    }
    commitToThread(threadId);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    commitToThread(threadId);
  };

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="wait">
        {isCommitted ? (
          <motion.div
            key="committed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30"
          >
            <div className="size-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="size-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="ds-label text-amber-700 dark:text-amber-400 font-semibold">
                Committed to this thesis
              </p>
              <p className="ds-caption text-amber-600/80 dark:text-amber-500/80">
                Your roadmap has been updated. Pinned to your inbox.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClick}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30 rounded-full flex-shrink-0"
            >
              <PinOff className="size-4 mr-1.5" />
              Uncommit
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="uncommitted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Button
              onClick={handleClick}
              className="w-full rounded-xl h-12 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-sm"
            >
              <Pin className="size-4" />
              Commit to this Thesis
            </Button>
            <p className="ds-caption text-muted-foreground text-center mt-1.5">
              This will update your roadmap and pin this thread
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation dialog for switching commitment */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="p-4 rounded-xl border border-border bg-muted/50"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="size-4 text-ai-solid mt-0.5 flex-shrink-0" />
              <div>
                <p className="ds-label mb-1">Switch your commitment?</p>
                <p className="ds-small text-muted-foreground mb-3">
                  You're already committed to another thesis. Committing here will update your previous commitment.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleConfirm} className="rounded-full">
                    Yes, switch
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConfirm(false)}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
