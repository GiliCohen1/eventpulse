import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { type IChatMessage } from '@eventpulse/shared-types';
import { Avatar } from '@/components/atoms/Avatar.js';
import { Button } from '@/components/atoms/Button.js';
import { Spinner } from '@/components/atoms/Spinner.js';
import { formatRelative, classNames } from '@/lib/utils.js';
import { t } from '@/lib/i18n.js';

interface ChatWindowProps {
  messages: IChatMessage[];
  isLoading: boolean;
  onSend: (content: string) => void;
  isSending?: boolean;
  currentUserId?: string;
}

export function ChatWindow({
  messages,
  isLoading,
  onSend,
  isSending = false,
  currentUserId,
}: ChatWindowProps): JSX.Element {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-secondary-200 bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-96 flex-col rounded-xl border border-secondary-200 bg-white">
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-secondary-500">{t('chat.empty')}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender.userId === currentUserId;
            const displayName = `${msg.sender.firstName} ${msg.sender.lastName}`.trim();
            return (
              <div
                key={msg.id}
                className={classNames('flex gap-3', isOwnMessage && 'flex-row-reverse')}
              >
                <Avatar firstName={msg.sender.firstName} lastName={msg.sender.lastName} size="sm" />
                <div className={classNames('max-w-[70%]', isOwnMessage && 'text-right')}>
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-xs font-medium text-secondary-700">
                      {displayName || t('chat.anonymous')}
                    </span>
                    <span className="text-[10px] text-secondary-400">
                      {formatRelative(msg.createdAt)}
                    </span>
                  </div>
                  <div
                    className={classNames('message-bubble', isOwnMessage && 'message-bubble--own')}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-secondary-200 px-4 py-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.placeholder')}
          className="flex-1 rounded-full border border-secondary-300 bg-secondary-50 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSending}
          disabled={!input.trim()}
          leftIcon={<Send className="h-4 w-4" />}
        >
          {t('common.send')}
        </Button>
      </form>
    </div>
  );
}
