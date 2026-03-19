import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Thread } from '@/types';
import { getInitialsColor } from '@/data/mockMatches';

interface ThreadItemProps {
  thread: Thread;
  isCommitted: boolean;
}

function StarRating({ score }: { score: number }) {
  const full = Math.floor(score);
  const hasHalf = score % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3 ${
            i < full
              ? 'fill-amber-400 text-amber-400'
              : i === full && hasHalf
              ? 'fill-amber-200 text-amber-400'
              : 'text-border fill-border'
          }`}
        />
      ))}
    </div>
  );
}

export function ThreadItem({ thread, isCommitted }: ThreadItemProps) {
  const lastMessage = thread.messages[thread.messages.length - 1];
  const preview = lastMessage?.content.replace(/\*\*/g, '').replace(/\*/g, '').slice(0, 80) + '...';
  const timeAgo = getTimeAgo(thread.lastActivity);

  return (
    <Link to={`/thread/${thread.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200
          hover:shadow-md group
          ${isCommitted ? 'thread-committed' : 'border-border hover:border-foreground/20'}
          ${!thread.isRead ? 'bg-muted/30' : ''}
        `}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className={`size-10 ${getInitialsColor(thread.card.initials)}`}>
            <AvatarFallback className={`text-sm font-semibold ${getInitialsColor(thread.card.initials)}`}>
              {thread.card.initials}
            </AvatarFallback>
          </Avatar>
          {isCommitted && (
            <div className="absolute -top-1 -right-1 size-4 bg-amber-400 rounded-full flex items-center justify-center">
              <Pin className="size-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`ds-label truncate text-foreground ${!thread.isRead ? 'font-semibold' : ''}`}>
                {thread.card.name}
              </span>
              {isCommitted && (
                <Badge className="ds-badge bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
                  Committed
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StarRating score={thread.card.compatibilityScore} />
              <span className="ds-caption text-muted-foreground">{timeAgo}</span>
            </div>
          </div>

          {thread.card.topicTitle && (
            <p className="ds-caption text-muted-foreground truncate mb-1">
              {thread.card.topicTitle}
            </p>
          )}

          <p className={`ds-small truncate ${!thread.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
            {preview}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {thread.card.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="ds-badge px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Unread indicator */}
        {!thread.isRead && (
          <div className="size-2 bg-primary rounded-full flex-shrink-0 mt-2" />
        )}
      </motion.div>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const now = Date.now();
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
