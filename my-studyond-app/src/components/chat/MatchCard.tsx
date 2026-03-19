import { Star, Building2, GraduationCap, BookOpen, MapPin, Laptop } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { MatchCard as MatchCardType } from '@/types';
import { getInitialsColor } from '@/data/mockMatches';

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
  if (type === 'company') return <Building2 className="size-3.5" />;
  if (type === 'supervisor') return <GraduationCap className="size-3.5" />;
  return <BookOpen className="size-3.5" />;
}

function WorkplaceBadge({ type }: { type?: MatchCardType['workplaceType'] }) {
  if (!type) return null;
  const labels = { remote: 'Remote', hybrid: 'Hybrid', on_site: 'On-site' };
  const icons = {
    remote: <Laptop className="size-3" />,
    hybrid: <MapPin className="size-3" />,
    on_site: <Building2 className="size-3" />,
  };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground ds-badge border border-border">
      {icons[type]}
      {labels[type]}
    </span>
  );
}

export function MatchCard({ card, isTop = false }: MatchCardProps) {
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
        <Avatar className={`size-14 flex-shrink-0 ${getInitialsColor(card.initials)}`}>
          <AvatarFallback
            className={`text-lg font-bold ${getInitialsColor(card.initials)}`}
          >
            {card.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="ds-title-cards font-semibold leading-tight">{card.name}</h3>
              <p className="ds-small text-muted-foreground mt-0.5 truncate">{card.subtitle}</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground ds-badge flex-shrink-0">
              <EntityIcon type={card.entityType} />
              {card.entityType === 'company' ? 'Company' : card.entityType === 'supervisor' ? 'Professor' : 'Topic'}
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

      {/* Tags + workplace */}
      <div className="px-5 pb-5 flex flex-wrap gap-1.5 items-center">
        {card.workplaceType && <WorkplaceBadge type={card.workplaceType} />}
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-secondary-foreground ds-badge"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
