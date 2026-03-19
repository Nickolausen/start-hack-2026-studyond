import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, Lock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { RoadmapStep } from '@/types';

function StepIcon({ status }: { status: RoadmapStep['status'] }) {
  if (status === 'completed') {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="size-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
      >
        <Check className="size-4 text-white" strokeWidth={2.5} />
      </motion.div>
    );
  }
  if (status === 'current') {
    return (
      <div className="size-8 rounded-full bg-ai flex items-center justify-center flex-shrink-0 ai-pulse">
        <Circle className="size-3 text-white fill-white" />
      </div>
    );
  }
  return (
    <div className="size-8 rounded-full border-2 border-border bg-background flex items-center justify-center flex-shrink-0">
      <Lock className="size-3.5 text-muted-foreground" />
    </div>
  );
}

function ConnectorLine({ completed }: { completed: boolean }) {
  return (
    <div className="flex-1 h-0.5 bg-border mx-2 overflow-hidden relative">
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 bg-emerald-400 origin-left"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function Roadmap() {
  const { roadmapSteps } = useAppStore();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {roadmapSteps.map((step, index) => (
          <div key={step.id} className="flex items-center min-w-0">
            {/* Step node */}
            <div className="flex flex-col items-center gap-2 min-w-[80px] max-w-[120px]">
              <StepIcon status={step.status} />
              <div className="text-center">
                <p
                  className={`ds-label leading-tight text-center ${
                    step.status === 'completed'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : step.status === 'current'
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
                {step.status === 'current' && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ds-caption text-muted-foreground mt-0.5 hidden sm:block line-clamp-2"
                  >
                    {step.description}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Connector line between steps */}
            {index < roadmapSteps.length - 1 && (
              <ConnectorLine completed={step.status === 'completed'} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
