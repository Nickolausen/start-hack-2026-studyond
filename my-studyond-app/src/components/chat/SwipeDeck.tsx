import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchCard } from './MatchCard';
import { SwipeActions } from './SwipeActions';
import { useAppStore } from '@/store/useAppStore';
import type { MatchCard as MatchCardType } from '@/types';
import { Link } from 'react-router-dom';

interface SwipeDeckProps {
  cards: MatchCardType[];
  onDeckEmpty?: () => void;
}

function DraggableCard({
  card,
  isTop,
  stackIndex,
  onLike,
  onPass,
}: {
  card: MatchCardType;
  isTop: boolean;
  stackIndex: number;
  onLike: () => void;
  onPass: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (_: unknown, info: { velocity: { x: number }; offset: { x: number } }) => {
    const threshold = 100;
    const vel = info.velocity.x;
    const offset = info.offset.x;

    if (offset > threshold || vel > 500) {
      onLike();
    } else if (offset < -threshold || vel < -500) {
      onPass();
    }
  };

  if (!isTop) {
    // Background cards in the stack
    const scale = 1 - stackIndex * 0.04;
    const yOffset = stackIndex * 10;
    return (
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          scale,
          y: yOffset,
          zIndex: -stackIndex,
          originY: 1,
        }}
      >
        <MatchCard card={card} isTop={false} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex: 10 }}
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      animate={{ scale: 1, opacity: 1 }}
      initial={{ scale: 0.95, opacity: 0.8 }}
      transition={{ duration: 0.2 }}
      whileDrag={{ scale: 1.02 }}
    >
      {/* Like overlay */}
      <motion.div
        className="absolute top-6 right-6 z-20 px-4 py-2 rounded-xl border-4 border-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/80"
        style={{ opacity: likeOpacity, rotate: -12 }}
      >
        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xl tracking-wide uppercase">
          Like!
        </span>
      </motion.div>

      {/* Pass overlay */}
      <motion.div
        className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl border-4 border-red-300 bg-red-50/90 dark:bg-red-950/80"
        style={{ opacity: passOpacity, rotate: 12 }}
      >
        <span className="text-red-500 font-bold text-xl tracking-wide uppercase">
          Pass
        </span>
      </motion.div>

      <MatchCard card={card} isTop={true} />
    </motion.div>
  );
}

export function SwipeDeck({ cards, onDeckEmpty }: SwipeDeckProps) {
  const [deck, setDeck] = useState<MatchCardType[]>(cards);
  const [likedCount, setLikedCount] = useState(0);
  const { saveThread } = useAppStore();

  const currentIndex = cards.length - deck.length;

  const handleLike = useCallback(() => {
    if (deck.length === 0) return;
    const card = deck[deck.length - 1];
    saveThread(card);
    setLikedCount((c) => c + 1);
    setDeck((prev) => prev.slice(0, -1));
    if (deck.length === 1) onDeckEmpty?.();
  }, [deck, saveThread, onDeckEmpty]);

  const handlePass = useCallback(() => {
    if (deck.length === 0) return;
    setDeck((prev) => prev.slice(0, -1));
    if (deck.length === 1) onDeckEmpty?.();
  }, [deck, onDeckEmpty]);

  if (deck.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center space-y-4"
      >
        <div className="size-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle className="size-8 text-emerald-500" />
        </div>
        <div>
          <h3 className="ds-title-sm mb-1 text-foreground">All done!</h3>
          <p className="ds-small text-muted-foreground">
            You reviewed all {cards.length} matches.
            {likedCount > 0 && ` You liked ${likedCount} — check your inbox.`}
          </p>
        </div>
        {likedCount > 0 && (
          <Link to="/">
            <Button className="rounded-full gap-2 bg-ai">
              <Sparkles className="size-4" />
              View Saved Threads
            </Button>
          </Link>
        )}
      </motion.div>
    );
  }

  // Show top 3 cards in a visual stack
  const visibleCards = deck.slice(-3).reverse();

  return (
    <div className="flex flex-col gap-6">
      {/* Card stack */}
      <div className="relative" style={{ height: '520px' }}>
        <AnimatePresence mode="popLayout">
          {visibleCards.map((card, stackIndex) => {
            const isTop = stackIndex === visibleCards.length - 1;
            return (
              <DraggableCard
                key={card.id}
                card={card}
                isTop={isTop}
                stackIndex={visibleCards.length - 1 - stackIndex}
                onLike={handleLike}
                onPass={handlePass}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <SwipeActions
        onLike={handleLike}
        onPass={handlePass}
        currentIndex={currentIndex}
        total={cards.length}
      />
    </div>
  );
}
