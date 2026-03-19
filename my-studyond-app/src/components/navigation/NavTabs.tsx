import { cn } from '@/lib/utils';

interface NavTabsProps {
  activeTab: 'roadmap' | 'matches';
  onTabChange: (tab: 'roadmap' | 'matches') => void;
  matchCount?: number;
}

export function NavTabs({ activeTab, onTabChange, matchCount = 0 }: NavTabsProps) {
  return (
    <div className="md:hidden flex gap-1 px-4 py-3 border-b border-border bg-background sticky top-16 z-30">
      <button
        onClick={() => onTabChange('roadmap')}
        className={cn(
          'flex-1 py-2 px-3 rounded-lg ds-label font-medium transition-colors',
          activeTab === 'roadmap'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
        )}
      >
        Roadmap
      </button>
      <button
        onClick={() => onTabChange('matches')}
        className={cn(
          'flex-1 py-2 px-3 rounded-lg ds-label font-medium transition-colors flex items-center justify-center gap-2',
          activeTab === 'matches'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
        )}
      >
        Matches
        {matchCount > 0 && (
          <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary/20 text-xs font-bold">
            {matchCount}
          </span>
        )}
      </button>
    </div>
  );
}
