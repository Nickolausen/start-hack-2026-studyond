import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/store/useAppStore';
import type { MatchCard } from '@/types';

// Parse AI response text to extract JSON match cards.
// Also strips partial JSON fences during streaming — anything from ```json onwards
// is hidden in the chat UI (it will appear as match cards in the swipe deck instead).
function parseAIResponse(content: string): {
  text: string;
  matches: MatchCard[] | null;
} {
  const fenceStart = content.indexOf('```json');
  if (fenceStart === -1) {
    // No JSON fence at all — also strip trailing lone backtick sequences
    const partialFence = content.indexOf('```');
    if (partialFence !== -1) {
      return { text: content.slice(0, partialFence).trim(), matches: null };
    }
    return { text: content, matches: null };
  }

  // Text before the fence
  const textBefore = content.slice(0, fenceStart).trim();

  // Try to parse complete block
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.matches && Array.isArray(parsed.matches)) {
        return { text: textBefore, matches: parsed.matches as MatchCard[] };
      }
    } catch {
      // Malformed JSON — still hide it
    }
  }

  // Fence started but not yet complete — hide everything from the fence start
  return { text: textBefore, matches: null };
}

// Extract plain text from UIMessage parts
function getTextFromParts(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('');
}

// Typing indicator bubble
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="size-7 rounded-full bg-ai flex items-center justify-center flex-shrink-0">
        <Sparkles className="size-3.5 text-white" />
      </div>
      <div className="chat-bubble-ai flex gap-1 items-center py-3">
        <span className="typing-dot size-1.5 bg-muted-foreground rounded-full" />
        <span className="typing-dot size-1.5 bg-muted-foreground rounded-full" />
        <span className="typing-dot size-1.5 bg-muted-foreground rounded-full" />
      </div>
    </div>
  );
}

interface ChatInterfaceProps {
  onMatchesReceived?: (matches: MatchCard[]) => void;
}

const SUGGESTED_PROMPTS = [
  'I want to work on LLM efficiency for my thesis',
  'Find me industry thesis opportunities in AI or ML',
  'I\'m interested in sustainability and data science',
  'Match me with academic supervisors at ETH or EPFL',
];

export function ChatInterface({ onMatchesReceived }: ChatInterfaceProps) {
  const { profile, buildSystemContext } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  const [hasShownDeck, setHasShownDeck] = useState(false);

  const systemContext = buildSystemContext();

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onFinish: ({ message }) => {
      const rawText = getTextFromParts(message.parts as Array<{ type: string; text?: string }>);
      const { matches } = parseAIResponse(rawText);
      if (matches && matches.length > 0 && !hasShownDeck) {
        setHasShownDeck(true);
        onMatchesReceived?.(matches);
      }
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(
      { text: input.trim() },
      { body: { systemContext, studentId: profile.id, mode: 'search' } }
    );
    setInput('');
  };

  const handleSuggestedPrompt = (prompt: string) => {
    // Send immediately instead of just setting input
    sendMessage(
      { text: prompt },
      { body: { systemContext, studentId: profile.id, mode: 'search' } }
    );
    setHasShownDeck(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

        {/* Welcome state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-4"
          >
            {/* AI greeting */}
            <div className="flex items-end gap-2">
              <div className="size-7 rounded-full bg-ai flex items-center justify-center flex-shrink-0">
                <Sparkles className="size-3.5 text-white" />
              </div>
              <div className="chat-bubble-ai">
                <p className="ds-body">
                  Hi {profile.firstName}! I'm your AI thesis advisor.
                </p>
                <p className="ds-body mt-2">
                  Tell me what you want to work on — your interests, career goals, or a specific topic — and I'll find the best matching companies, supervisors, and thesis topics for you.
                </p>
              </div>
            </div>

            {/* Suggested prompts */}
            <div className="space-y-2 pl-9">
              <p className="ds-caption text-muted-foreground">Try one of these:</p>
              <div className="flex flex-col gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="text-left px-3.5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-foreground/20 transition-colors duration-150 ds-small text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const rawText = getTextFromParts(message.parts as Array<{ type: string; text?: string }>);
            const { text, matches } = parseAIResponse(rawText);

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                {!isUser ? (
                  <div className="size-7 rounded-full bg-ai flex items-center justify-center flex-shrink-0">
                    <Sparkles className="size-3.5 text-white" />
                  </div>
                ) : (
                  <Avatar className="size-7 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message content */}
                <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="ds-body whitespace-pre-wrap">{text || rawText}</p>
                  </div>
                  {!isUser && matches && matches.length > 0 && (
                    <p className="ds-caption text-muted-foreground pl-1">
                      {matches.length} matches found — swipe deck loaded
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your thesis idea or what you're looking for..."
            className="text-primary flex-1 resize-none rounded-xl min-h-[44px] max-h-[120px] ds-body"
            rows={1}
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-full size-11 bg-ai hover:opacity-90 flex-shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="ds-caption text-muted-foreground mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
