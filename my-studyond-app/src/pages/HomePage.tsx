import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThreadInbox } from '@/components/home/ThreadInbox';
import { useAppStore } from '@/store/useAppStore';
import { RoadmapViewer } from '@/components/custom/roadmap/roadmap-viewer';
import { MobileNav } from '@/components/navigation/MobileNav';
import { NavTabs } from '@/components/navigation/NavTabs';

export function HomePage() {
  const { profile, savedThreads, roadmapSteps } = useAppStore();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'matches'>('roadmap');

  const completedSteps = roadmapSteps.filter((s) => s.status === 'committed').length;
  const currentStep = roadmapSteps.find((s) => s.status === 'open');

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Mobile Navigation */}
      <MobileNav progressTitle={currentStep?.label} />

      {/* Mobile Tabs */}
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} matchCount={savedThreads.length} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto page-enter">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
          {/* Desktop: Header spans both columns */}
          <div className="flex items-start justify-between mb-6 md:mb-8">
            <div>
              <h1 className="ds-title-lg text-foreground">
                Hi, {profile.firstName} <img src='https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUyYnk3NWxkbmRneGU5cTJkMm1iMTl5bXJ5OGtlcXVpczFqMjd6bHBveCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/6hKL8BI8rRNrMRFtAx/200w.gif' />
              </h1>
              <p className="ds-body text-muted-foreground mt-1">
                {currentStep
                  ? `Next up: ${currentStep.label}`
                  : 'Your thesis journey is on track.'}
              </p>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar: Roadmap (hidden on mobile, shown via tab) */}
            <aside className="hidden md:flex flex-shrink-0 flex-col md:col-span-3">
              {/* Progress Summary */}
              <div className="mb-6 flex items-center w-full gap-3 p-4 bg-card border border-border rounded-lg">
                <TrendingUp className="size-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="ds-label text-foreground text-xs">Progress</span>
                    <span className="ds-caption text-muted-foreground">
                      {completedSteps} / {roadmapSteps.length}
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full bg-ai rounded-full transition-all duration-700"
                      style={{ width: `${(completedSteps / roadmapSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Roadmap Card */}
              <div className="p-10 w-full h-fit bg-card border border-border rounded-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="ds-title-cards text-foreground">Roadmap</h2>
                </div>
                <RoadmapViewer />
              </div>
            </aside>

            {/* Main Content: Threads/Matches */}
            <main className="flex-1 min-w-0 md:col-span-9 col-span-full">
              {/* Mobile: Show Roadmap or Threads based on tab */}
              <div className="md:hidden">
                {activeTab === 'roadmap' ? (
                  <div className="space-y-4">
                    {/* Mobile Roadmap View */}
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <div className="mb-4 flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <TrendingUp className="size-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="ds-label text-foreground text-xs">Progress</span>
                            <span className="ds-caption text-muted-foreground">
                              {completedSteps} / {roadmapSteps.length}
                            </span>
                          </div>
                          <div className="w-full bg-border rounded-full h-1 overflow-hidden">
                            <div
                              className="h-full bg-ai rounded-full transition-all duration-700"
                              style={{ width: `${(completedSteps / roadmapSteps.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="ds-title-cards text-foreground">Roadmap</h2>
                      </div>
                      <RoadmapViewer />
                    </div>
                  </div>
                ) : (
                  /* Mobile Matches View */
                  <div className="space-y-4">
                    <ThreadInbox />
                  </div>
                )}
              </div>

              {/* Desktop: Always show matches */}
              <div className="hidden md:block">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="ds-title-md text-foreground">Saved Matches</h2>
                    {savedThreads.length > 0 && (
                      <p className="ds-small text-muted-foreground mt-0.5">
                        {savedThreads.length} match{savedThreads.length !== 1 ? 'es' : ''} saved
                      </p>
                    )}
                  </div>
                  <Link to="/chat">
                    <Button variant="outline" size="sm" className="bg-ai text-primary rounded-full gap-2">
                      <Sparkles className="size-3.5" />
                      Find more
                    </Button>
                  </Link>
                </div>
                <ThreadInbox />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
