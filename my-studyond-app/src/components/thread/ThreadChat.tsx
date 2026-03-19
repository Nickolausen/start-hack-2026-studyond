import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/store/useAppStore';
import { getInitialsColor, getInitialsFromName } from '@/data/mockMatches';
import { sendThreadMessage, generateThreadQuestions } from '@/api';
import type { Thread, ThreadMessage } from '@/types';

// Fallback questions derived from card context (used while AI-generated ones load)
function getFallbackQuestions(thread: Thread): string[] {
  const { entityType, tags, topicTitle } = thread.card;
  if (entityType === 'field') {
    return [
      'What thesis topics are popular in this field right now?',
      'Which companies work in this area?',
      'What skills are most valued in this field?',
      'Which supervisors specialize in this area?',
    ];
  }
  if (entityType === 'expert') {
    return [
      'What is your role and day-to-day work like?',
      'Do you offer interviews or mentoring for thesis students?',
      'What kind of thesis projects have you supervised before?',
      'What technical skills matter most for working with you?',
    ];
  }
  if (entityType === 'supervisor') {
    return [
      'What are your main current research areas?',
      'How many students are you supervising right now?',
      'What do you expect from a thesis student?',
      'What is the typical thesis timeline in your group?',
    ];
  }
  if (entityType === 'company') {
    return [
      'What data or tools will I have access to?',
      'Is there an employment contract alongside the thesis?',
      'How does coordination with a university supervisor work?',
      'What technical skills matter most for this collaboration?',
    ];
  }
  // topic
  const firstTag = tags[0]?.replace('#', '') ?? 'this research area';
  return [
    `How does ${firstTag} play a role in this thesis?`,
    topicTitle ? `What is the expected methodology for "${topicTitle}"?` : 'What research methodology is expected?',
    'How should I prepare my application or first contact?',
    'What does a typical week look like during this thesis?',
  ];
}

interface ThreadChatProps {
  thread: Thread;
}

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

export function ThreadChat({ thread }: ThreadChatProps) {
  const { profile, addMessageToThread, markThreadRead, buildSystemContext, buildRoadmapContext } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(
    getFallbackQuestions(thread)
  );
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initials = thread.card.initials ?? getInitialsFromName(thread.card.name);
  const colorClass = getInitialsColor(initials);

  const threadContext = {
    entityName: thread.card.name,
    entityType: thread.card.entityType,
    entityId: thread.card.entityId,
    topicTitle: thread.card.topicTitle,
    description: thread.card.description,
    tags: thread.card.tags,
    compatibilityScore: thread.card.compatibilityScore,
    companyId: thread.card.companyId,
    universityName: thread.card.university,
    fieldIds: thread.card.fieldIds,
    supervisorIds: thread.card.supervisorIds,
    expertIds: thread.card.expertIds,
  };

  const roadmapContext = buildRoadmapContext();

  // Mark as read + generate AI-powered suggested questions on mount
  useEffect(() => {
    markThreadRead(thread.id);

    // Only fetch questions if this is the initial state (1 message = just the welcome)
    if (thread.messages.length === 1) {
      setQuestionsLoading(true);
      generateThreadQuestions(threadContext, roadmapContext)
        .then((questions) => {
          if (questions.length > 0) setSuggestedQuestions(questions);
        })
        .catch(() => {
          // Keep fallback questions silently
        })
        .finally(() => setQuestionsLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages, isLoading]);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMessage: ThreadMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    addMessageToThread(thread.id, userMessage);

    try {
      const responseText = await sendThreadMessage(
        messageText,
        threadContext,
        buildSystemContext(),
        roadmapContext
      );

      const assistantMessage: ThreadMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      addMessageToThread(thread.id, assistantMessage);
    } catch (err) {
      console.error('[ThreadChat] Send error:', err);
      addMessageToThread(thread.id, {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `Sorry, I couldn't generate a response. Please try again.`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, thread.id, threadContext, addMessageToThread, buildSystemContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showSuggestions = thread.messages.length === 1 && !isLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <AnimatePresence initial={false}>
          {thread.messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {!isUser ? (
                  <Avatar className={`size-7 flex-shrink-0 ${colorClass}`}>
                    <AvatarFallback className={`text-xs font-semibold ${colorClass}`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="size-7 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[80%] ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                  <p className="ds-body whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && <TypingIndicator />}

        {/* AI-generated suggested replies — only after the welcome message */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-2 pl-9"
            >
              <p className="ds-caption text-muted-foreground flex items-center gap-1.5">
                {questionsLoading ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Generating questions...
                  </>
                ) : (
                  'Quick questions — click to send:'
                )}
              </p>
              <div className="flex flex-col gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    disabled={questionsLoading || isLoading}
                    className="text-left px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted hover:border-foreground/20 transition-colors ds-small text-foreground disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${thread.card.name}...`}
            className="text-primary flex-1 resize-none rounded-xl min-h-[44px] max-h-[100px]"
            rows={1}
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="rounded-full size-11 bg-ai hover:opacity-90 flex-shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
