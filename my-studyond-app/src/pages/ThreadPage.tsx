import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Building2, GraduationCap, BookOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThreadChat } from '@/components/thread/ThreadChat';
import { CommitButton } from '@/components/thread/CommitButton';
import { useAppStore } from '@/store/useAppStore';
import { getInitialsColor } from '@/data/mockMatches';

function EntityTypeIcon({ type }: { type: string }) {
  if (type === 'company') return <Building2 className="size-3.5" />;
  if (type === 'supervisor') return <GraduationCap className="size-3.5" />;
  return <BookOpen className="size-3.5" />;
}

function MiniStars({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3 ${
            i < Math.floor(score)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-border text-border'
          }`}
        />
      ))}
    </div>
  );
}

export function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { getThread, removeThread, committedThreadId } = useAppStore();

  const thread = threadId ? getThread(threadId) : undefined;

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="ds-body text-muted-foreground">Thread not found.</p>
        <Link to="/">
          <Button variant="outline" className="rounded-full">
            Go home
          </Button>
        </Link>
      </div>
    );
  }

  const isCommitted = committedThreadId === thread.id;
  const card = thread.card;

  const handleDelete = () => {
    removeThread(thread.id);
    navigate('/');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row page-enter">
      {/* Left: Thread metadata + commit button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-shrink-0 w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-border bg-card overflow-y-auto"
      >
        <div className="p-5 space-y-5">
          {/* Back + actions */}
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-full gap-1.5 -ml-2">
                <ArrowLeft className="size-4" />
                Inbox
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:text-destructive size-8"
              onClick={handleDelete}
              aria-label="Delete thread"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {/* Entity header */}
          <div className="flex items-start gap-3">
            <Avatar className={`size-14 flex-shrink-0 ${getInitialsColor(card.initials)}`}>
              <AvatarFallback className={`text-lg font-bold ${getInitialsColor(card.initials)}`}>
                {card.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="ds-title-sm font-semibold leading-tight text-foreground">{card.name}</h2>
              <p className="ds-small text-muted-foreground mt-0.5">{card.subtitle}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground ds-badge">
                  <EntityTypeIcon type={card.entityType} />
                  {card.entityType === 'company' ? 'Company' : card.entityType === 'supervisor' ? 'Professor' : 'Topic'}
                </span>
                <div className="flex items-center gap-1.5">
                  <MiniStars score={card.compatibilityScore} />
                  <span className="ds-caption text-muted-foreground">{card.compatibilityScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Topic title */}
          {card.topicTitle && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="ds-caption text-muted-foreground mb-0.5">Topic</p>
              <p className="ds-label text-foreground">{card.topicTitle}</p>
            </div>
          )}

          {/* AI rationale */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
              <p className="ds-caption text-ai-solid font-medium">Why this matches you</p>
            </div>
            <p className="ds-small text-muted-foreground leading-relaxed">{card.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-secondary-foreground ds-badge"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Commit button */}
          <CommitButton threadId={thread.id} />
        </div>
      </motion.div>

      {/* Right: Chat area */}
      <div className={`flex-1 flex flex-col min-h-0 ${isCommitted ? 'border-t-2 lg:border-t-0 lg:border-l-2 border-amber-400' : ''}`}>
        {isCommitted && (
          <div className="flex-shrink-0 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800">
            <p className="ds-caption text-amber-700 dark:text-amber-400 text-center">
              You are committed to this thesis
            </p>
          </div>
        )}
        <div className="flex-1 min-h-0">
          <ThreadChat thread={thread} />
        </div>
      </div>
    </div>
  );
}
