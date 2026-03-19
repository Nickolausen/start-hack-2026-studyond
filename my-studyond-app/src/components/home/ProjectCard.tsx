import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, ChevronDown, Building2, GraduationCap, UserCheck, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import type { ProjectState } from '@/types';

const STATE_LABELS: Record<ProjectState, string> = {
  proposed: 'Proposed',
  applied: 'Applied',
  agreed: 'Agreed',
  in_progress: 'In Progress',
  withdrawn: 'Withdrawn',
  rejected: 'Rejected',
  canceled: 'Canceled',
  completed: 'Completed',
};

const STATE_COLORS: Record<ProjectState, string> = {
  proposed: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  applied: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  agreed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  withdrawn: 'bg-muted text-muted-foreground',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  canceled: 'bg-muted text-muted-foreground',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
};

// Valid next states from each state
const NEXT_STATES: Partial<Record<ProjectState, ProjectState[]>> = {
  proposed: ['applied', 'withdrawn'],
  applied: ['agreed', 'rejected', 'withdrawn'],
  agreed: ['in_progress', 'withdrawn'],
  in_progress: ['completed', 'canceled'],
};

export function ProjectCard() {
  const { activeProject, updateProjectState, roadmapSteps } = useAppStore();
  const [showActions, setShowActions] = useState(false);

  if (!activeProject) return null;

  const nextStates = NEXT_STATES[activeProject.state] ?? [];
  const isTerminal = nextStates.length === 0;

  // Build summary from committed roadmap steps
  const committedDetails = roadmapSteps
    .filter((s) => s.status === 'committed' && s.committedEntityName)
    .map((s) => ({ id: s.id, label: s.label, name: s.committedEntityName! }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <Rocket className="size-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="ds-title-cards font-semibold text-foreground">{activeProject.title}</h3>
            <span className={`px-2.5 py-0.5 rounded-full ds-badge ${STATE_COLORS[activeProject.state]}`}>
              {STATE_LABELS[activeProject.state]}
            </span>
          </div>
          <p className="ds-caption text-muted-foreground mt-1">
            Thesis Project · Created {new Date(activeProject.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Description from topic */}
      {activeProject.description && (
        <p className="ds-small text-muted-foreground leading-relaxed line-clamp-3">
          {activeProject.description}
        </p>
      )}

      {/* Committed step summary */}
      {committedDetails.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {committedDetails.map((d) => {
            const Icon = d.id === 'field' ? Compass
              : d.id === 'company' ? Building2
              : d.id === 'expert' ? UserCheck
              : d.id === 'supervisor' ? GraduationCap
              : null;
            return (
              <span key={d.id} className="ds-caption text-muted-foreground flex items-center gap-1">
                {Icon && <Icon className="size-3 flex-shrink-0" />}
                <span className="font-medium text-foreground">{d.name}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Status actions */}
      {!isTerminal && nextStates.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => setShowActions(!showActions)}
          >
            Update Status
            <ChevronDown className={`size-3.5 transition-transform ${showActions ? 'rotate-180' : ''}`} />
          </Button>
          {showActions && nextStates.map((state) => (
            <Button
              key={state}
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                updateProjectState(activeProject.id, state);
                setShowActions(false);
              }}
            >
              {STATE_LABELS[state]}
            </Button>
          ))}
        </div>
      )}

      {activeProject.state === 'completed' && (
        <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
          <p className="ds-small text-emerald-700 dark:text-emerald-300 font-medium">
            Congratulations! Your thesis project is complete.
          </p>
        </div>
      )}
    </motion.div>
  );
}
