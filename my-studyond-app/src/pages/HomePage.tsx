import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Roadmap } from '@/components/home/Roadmap';
import { ThreadInbox } from '@/components/home/ThreadInbox';
import { useAppStore } from '@/store/useAppStore';

export function HomePage() {
  const { profile, savedThreads, committedThreadId, roadmapSteps } = useAppStore();
  const completedSteps = roadmapSteps.filter((s) => s.status === 'completed').length;
  const currentStep = roadmapSteps.find((s) => s.status === 'current');

  return (
    <div className="h-full overflow-y-auto page-enter">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-10">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="ds-title-lg text-foreground">
              Hi, {profile.firstName} 👋
            </h1>
            <p className="ds-body text-muted-foreground mt-1">
              {currentStep
                ? `Next up: ${currentStep.label}`
                : 'Your thesis journey is on track.'}
            </p>
          </div>
          <Link to="/chat">
            <Button className="bg-ai ai-pulse rounded-full gap-2 hidden sm:flex">
              <Sparkles className="size-4" />
              AI Advisor
            </Button>
          </Link>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-xl border border-border">
          <TrendingUp className="size-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="ds-label text-foreground">Thesis Journey</span>
              <span className="ds-label text-muted-foreground">
                {completedSteps} / {roadmapSteps.length} steps
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${(completedSteps / roadmapSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="ds-title-sm text-foreground">Your Roadmap</h2>
            {committedThreadId && (
              <span className="ds-caption text-emerald-600 dark:text-emerald-400 font-medium">
                Supervisor secured
              </span>
            )}
          </div>
          <div className="p-4 sm:p-6 bg-card border border-border rounded-xl">
            <Roadmap />
          </div>
        </section>

        {/* Saved Threads */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="ds-title-sm text-foreground">Saved Threads</h2>
              {savedThreads.length > 0 && (
                <p className="ds-small text-muted-foreground mt-0.5">
                  {savedThreads.length} match{savedThreads.length !== 1 ? 'es' : ''} saved
                </p>
              )}
            </div>
            <Link to="/chat">
              <Button variant="outline" size="sm" className="rounded-full gap-2">
                <Sparkles className="size-3.5 text-ai-solid" />
                Find more
              </Button>
            </Link>
          </div>
          <ThreadInbox />
        </section>
      </div>
    </div>
  );
}
