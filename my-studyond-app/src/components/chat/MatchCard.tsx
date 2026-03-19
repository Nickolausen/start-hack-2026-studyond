import { Star, Building2, GraduationCap, BookOpen, ExternalLink, Compass, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { MatchCard as MatchCardType } from '@/types';
import { getInitialsColor, getInitialsFromName } from '@/data/mockMatches';
import { useAppStore } from '@/store/useAppStore';

interface MatchCardProps {
  card: MatchCardType;
  isTop?: boolean;
}

function StarRating({ score }: { score: number }) {
  const full = Math.floor(score);
  const hasHalf = score % 1 >= 0.5;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`size-4 ${
              i < full
                ? 'fill-amber-400 text-amber-400'
                : i === full && hasHalf
                ? 'fill-amber-200 text-amber-300'
                : 'text-border fill-border'
            }`}
          />
        ))}
      </div>
      <span className="ds-label text-amber-600 dark:text-amber-400 font-semibold">
        {score.toFixed(1)}
      </span>
      <span className="ds-caption text-muted-foreground">/ 5.0</span>
    </div>
  );
}

function EntityIcon({ type }: { type: MatchCardType['entityType'] }) {
  if (type === 'field') return <Compass className="size-3.5" />;
  if (type === 'company') return <Building2 className="size-3.5" />;
  if (type === 'expert') return <UserCheck className="size-3.5" />;
  if (type === 'supervisor') return <GraduationCap className="size-3.5" />;
  return <BookOpen className="size-3.5" />;
}

export function MatchCard({ card, isTop = false }: MatchCardProps) {
  const initials = card.initials ?? getInitialsFromName(card.name);
  const colorClass = getInitialsColor(initials);
  const navigate = useNavigate();
  const { savedThreads, saveThread } = useAppStore();

  const handleSeeDetails = (e: React.MouseEvent) => {
    // Prevent drag/swipe from triggering when the button is clicked
    e.stopPropagation();

    // Check if a thread already exists for this card
    const existing = savedThreads.find((t) => t.id === card.id);
    if (existing) {
      navigate(`/thread/${existing.id}`);
    } else {
      // Save the thread and navigate to it
      saveThread(card);
      navigate(`/thread/${card.id}`);
    }
  };

  return (
    <div
      className={`
        w-full bg-card border border-border rounded-2xl overflow-hidden
        flex flex-col
        ${isTop ? 'shadow-xl' : 'shadow-md'}
      `}
    >
      {/* Card Header — Entity identity */}
      <div className="p-5 pb-4 flex items-start gap-3 border-b border-border">
        <Avatar className={`size-14 flex-shrink-0 ${colorClass}`}>
          <AvatarFallback className={`text-lg font-bold ${colorClass}`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="ds-title-cards font-semibold leading-tight text-foreground">{card.name}</h3>
              <p className="ds-small text-muted-foreground mt-0.5 truncate">{card.subtitle}</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground ds-badge flex-shrink-0">
              <EntityIcon type={card.entityType} />
              {card.entityType === 'field' ? 'Field' : card.entityType === 'company' ? 'Company' : card.entityType === 'expert' ? 'Expert' : card.entityType === 'supervisor' ? 'Professor' : 'Topic'}
            </span>
          </div>
          {card.university && (
            <p className="ds-caption text-muted-foreground mt-1 flex items-center gap-1">
              <GraduationCap className="size-3" />
              {card.university}
            </p>
          )}
        </div>
      </div>

      {/* Topic title if present */}
      {card.topicTitle && (
        <div className="px-5 py-3 bg-muted/30 border-b border-border">
          <p className="ds-label text-foreground">{card.topicTitle}</p>
        </div>
      )}

      {/* Compatibility score */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <span className="ds-label text-muted-foreground">Match Score</span>
        <StarRating score={card.compatibilityScore} />
      </div>

      {/* AI-generated description */}
      <div className="px-5 py-4 flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="size-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
          <span className="ds-caption text-ai-solid font-medium">Why this matches you</span>
        </div>
        <p className="ds-small text-foreground leading-relaxed">{card.description}</p>
      </div>

      {/* Tags */}
      <div className="px-5 pb-3 flex flex-wrap gap-1.5 items-center">
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-secondary-foreground ds-badge"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* See Details button — only on the top card */}
      {isTop && (
        <div className="px-5 pb-5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeeDetails}
            className="w-full rounded-xl gap-2 ds-label border-border hover:border-foreground/30"
          >
            <ExternalLink className="size-3.5" />
            See Details & Chat
          </Button>
        </div>
      )}
    </div>
  );
}
