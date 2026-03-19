import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, PinOff, CheckCircle, ChevronDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import type { Thread, RoadmapStepId } from '@/types';

// Maps entity type to the roadmap step it most logically closes
const DEFAULT_STEP_FOR_ENTITY: Record<string, RoadmapStepId> = {
  field: 'field',
  topic: 'topic',
  supervisor: 'supervisor',
  company: 'company',
  expert: 'expert',
};

interface CommitButtonProps {
  thread: Thread;
}

export function CommitButton({ thread }: CommitButtonProps) {
  const {
    roadmapSteps,
    commitToThread,
    uncommitThread,
    pendingConflicts,
    pendingCommitThreadId,
    forceCommit,
    clearPendingConflicts,
  } = useAppStore();
  const isCommitted = thread.closedStepId !== null;
  const [showStepPicker, setShowStepPicker] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  // Show conflict dialog for this thread
  const hasConflict = pendingConflicts && pendingConflicts.length > 0 && pendingCommitThreadId === thread.id;

  // Pre-select the step based on entity type
  const [selectedStep, setSelectedStep] = useState<RoadmapStepId>(
    DEFAULT_STEP_FOR_ENTITY[thread.card.entityType] ?? 'topic'
  );

  const handleCommit = () => {
    if (isCommitted) {
      uncommitThread(thread.id);
      return;
    }
    setShowStepPicker(true);
  };

  const handleConfirmCommit = async () => {
    setIsCommitting(true);
    await commitToThread(thread.id, selectedStep);
    setIsCommitting(false);
    setShowStepPicker(false);
  };

  const handleForceCommit = async () => {
    setIsCommitting(true);
    await forceCommit();
    setIsCommitting(false);
  };

  const committedStep = roadmapSteps.find((s) => s.id === thread.closedStepId);

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
                Committed
              </p>
              {committedStep && (
                <p className="ds-caption text-amber-600/80 dark:text-amber-500/80">
                  Closes: {committedStep.label}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommit}
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
              onClick={handleCommit}
              disabled={isCommitting}
              className="w-full rounded-xl h-12 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-sm"
            >
              <Pin className="size-4" />
              Commit to this Thesis
            </Button>
            <p className="ds-caption text-muted-foreground text-center mt-1.5">
              Close a roadmap step and pin this thread
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step picker */}
      <AnimatePresence>
        {showStepPicker && !hasConflict && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="p-4 rounded-xl border border-border bg-card shadow-md space-y-3"
          >
            <p className="ds-label text-foreground">Which step does this close?</p>
            <p className="ds-caption text-muted-foreground -mt-1">
              Dependencies will be auto-committed from the database.
            </p>

            <div className="space-y-2">
              {roadmapSteps.map((step) => {
                const isAlreadyCommitted = step.status === 'committed';
                const isSelected = selectedStep === step.id;

                return (
                  <button
                    key={step.id}
                    onClick={() => !isAlreadyCommitted && setSelectedStep(step.id as RoadmapStepId)}
                    disabled={isAlreadyCommitted && step.committedThreadId !== thread.id}
                    className={`
                      w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all
                      ${isSelected
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                        : 'border-border hover:border-foreground/20 bg-background'}
                      ${isAlreadyCommitted && step.committedThreadId !== thread.id
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer'}
                    `}
                  >
                    <div
                      className={`size-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                        ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-border'}`}
                    >
                      {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="ds-label text-foreground">{step.label}</p>
                      <p className="ds-caption text-muted-foreground truncate">{step.description}</p>
                    </div>
                    {isAlreadyCommitted && (
                      <span className="ds-badge text-amber-600 dark:text-amber-400 flex-shrink-0">
                        {step.committedEntityName ?? 'Already set'}
                      </span>
                    )}
                    {isSelected && !isAlreadyCommitted && (
                      <ChevronDown className="size-4 text-amber-500 flex-shrink-0 rotate-[-90deg]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleConfirmCommit}
                disabled={isCommitting}
                size="sm"
                className="flex-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Pin className="size-3.5 mr-1.5" />
                {isCommitting ? 'Committing...' : 'Commit'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStepPicker(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict resolution dialog */}
      <AnimatePresence>
        {hasConflict && pendingConflicts && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="p-4 rounded-xl border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30 shadow-md space-y-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-orange-500 flex-shrink-0" />
              <p className="ds-label text-orange-700 dark:text-orange-400 font-semibold">
                Dependency Conflict
              </p>
            </div>
            <p className="ds-small text-orange-600 dark:text-orange-300">
              Committing this will overwrite existing decisions:
            </p>
            <div className="space-y-2">
              {pendingConflicts.map((conflict) => (
                <div key={conflict.stepId} className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
                  <p className="ds-caption text-orange-700 dark:text-orange-400">
                    <span className="font-semibold">{conflict.stepId}</span>: {conflict.currentEntityName} → {conflict.incomingEntityName}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleForceCommit}
                disabled={isCommitting}
                size="sm"
                className="flex-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isCommitting ? 'Overwriting...' : 'Overwrite & Commit'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { clearPendingConflicts(); setShowStepPicker(false); }}
                className="rounded-full"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
