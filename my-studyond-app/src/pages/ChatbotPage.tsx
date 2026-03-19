import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { SwipeDeck } from '@/components/chat/SwipeDeck';
import { useAppStore } from '@/store/useAppStore';
import type { MatchCard } from '@/types';
import { MOCK_MATCH_CARDS } from '@/data/mockMatches';

export function ChatbotPage() {
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [deckActive, setDeckActive] = useState(false);
  const [mobileView, setMobileView] = useState<'chat' | 'deck'>('chat');
  const { setSwipeDeck } = useAppStore();

  const handleMatchesReceived = (newMatches: MatchCard[]) => {
    setMatches(newMatches);
    setDeckActive(true);
    setSwipeDeck(newMatches);
    setMobileView('deck');
  };

  const loadDemoMatches = () => {
    handleMatchesReceived(MOCK_MATCH_CARDS);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Mobile toggle bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-border bg-background sm:hidden">
        <div className="flex rounded-full overflow-hidden border border-border">
          <button
            onClick={() => setMobileView('chat')}
            className={`px-4 py-1.5 ds-label transition-colors ${
              mobileView === 'chat'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setMobileView('deck')}
            disabled={!deckActive}
            className={`px-4 py-1.5 ds-label transition-colors disabled:opacity-40 ${
              mobileView === 'deck'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Matches {deckActive && `(${matches.length})`}
          </button>
        </div>

        {!deckActive && (
          <button
            onClick={loadDemoMatches}
            className="ds-caption text-ai-solid hover:opacity-70 transition-opacity"
          >
            Load demo
          </button>
        )}
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Chat panel */}
        <div
          className={`
            flex flex-col border-r border-border bg-background
            ${deckActive ? 'hidden sm:flex sm:w-[45%] lg:w-[40%]' : 'flex w-full'}
            ${mobileView === 'chat' ? '!flex w-full sm:!w-[45%] lg:!w-[40%]' : 'hidden sm:flex sm:w-[45%] lg:w-[40%]'}
          `}
        >
          <div className="flex-shrink-0 px-4 py-3 border-b border-border flex items-center gap-2">
            <div className="size-7 rounded-full bg-ai flex items-center justify-center">
              <Sparkles className="size-3.5 text-white" />
            </div>
            <span className="ds-title-cards text-foreground">AI Thesis Advisor</span>
            {!deckActive && (
              <button
                onClick={loadDemoMatches}
                className="ml-auto ds-caption text-ai-solid hover:opacity-70 transition-opacity"
              >
                Load demo matches
              </button>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ChatInterface onMatchesReceived={handleMatchesReceived} />
          </div>
        </div>

        {/* Swipe deck panel */}
        <AnimatePresence>
          {deckActive && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`
                flex-1 overflow-y-auto bg-muted/20
                ${mobileView === 'deck' ? 'flex' : 'hidden sm:flex'}
                flex-col
              `}
            >
              <div className="flex-shrink-0 px-4 py-3 border-b border-border flex items-center gap-2 bg-background">
                <Sparkles className="size-4 text-ai-solid" />
                <span className="ds-title-cards text-foreground">Your Matches</span>
                <span className="ds-badge text-muted-foreground ml-1">
                  {matches.length} found
                </span>
              </div>

              <div className="flex-1 px-4 py-6 flex flex-col items-center">
                <div className="w-full max-w-sm">
                  <SwipeDeck
                    cards={matches}
                    onDeckEmpty={() => {}}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state when no deck */}
        {!deckActive && (
          <div className="hidden sm:flex flex-1 flex-col items-center justify-center bg-muted/10 text-center px-8">
            <div className="size-20 rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950/40 dark:to-blue-950/40 flex items-center justify-center mb-5">
              <Sparkles className="size-9 text-ai-solid" />
            </div>
            <h3 className="ds-title-sm mb-2 text-foreground">Your matches will appear here</h3>
            <p className="ds-body text-muted-foreground max-w-xs">
              Describe your thesis idea in the chat and I'll generate a personalized swipe deck of matching companies, supervisors, and topics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
