import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, BookOpen, Building2, GraduationCap, ExternalLink, Compass, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { RoadmapStep } from '@/types';

const STEP_ICONS: Record<string, React.ReactNode> = {
  field: <Compass className="size-4" />,
  company: <Building2 className="size-4" />,
  expert: <UserCheck className="size-4" />,
  supervisor: <GraduationCap className="size-4" />,
  topic: <BookOpen className="size-4" />,
};

function StepCard({ step }: { step: RoadmapStep }) {
  const isCommitted = step.status === 'committed';
  const { savedThreads } = useAppStore();
  const committedThread = step.committedThreadId
    ? savedThreads.find((t) => t.id === step.committedThreadId)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300
        ${isCommitted
          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
          : 'border-border bg-muted/20 hover:border-foreground/20'}
      `}
    >
      {/* Step header */}
      <div className="flex items-start gap-3">
        <div
          className={`
            size-8 rounded-full flex items-center justify-center flex-shrink-0
            ${isCommitted
              ? 'bg-emerald-500'
              : 'bg-muted border-2 border-border'}
          `}
        >
          {isCommitted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Check className="size-4 text-white" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <span className={`text-muted-foreground`}>{STEP_ICONS[step.id]}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`ds-label font-semibold ${
              isCommitted ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'
            }`}
          >
            {step.label}
          </p>
          <p className="ds-caption text-muted-foreground mt-0.5">{step.description}</p>
        </div>

        {isCommitted && (
          <span className="flex-shrink-0 ds-badge px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Committed
          </span>
        )}
      </div>

      {/* Committed thread preview */}
      <AnimatePresence>
        {isCommitted && committedThread && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Link to={`/thread/${committedThread.id}`}>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="ds-label text-emerald-800 dark:text-emerald-300 truncate">
                    {step.committedEntityName ?? committedThread.card.topicTitle ?? committedThread.card.name}
                  </p>
                  <p className="ds-caption text-emerald-600/70 dark:text-emerald-500/70 truncate">
                    {step.committedEntityId ?? committedThread.card.name}
                    {step.committedAt && ` · ${new Date(step.committedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <ExternalLink className="size-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Open step CTA */}
      {!isCommitted && (
        <div className="flex items-center gap-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <Link to="/chat">
            <span className="ds-caption text-ai-solid hover:opacity-70 transition-opacity cursor-pointer">
              Find with AI Advisor →
            </span>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export function Roadmap() {
  const { roadmapSteps } = useAppStore();

  return (
    <div className="w-full space-y-3">
      {roadmapSteps.map((step) => (
        <StepCard key={step.id} step={step} />
      ))}
    </div>
  );
}
