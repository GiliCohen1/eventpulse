import { useState, type FormEvent } from 'react';
import { ChevronUp, MessageCircleQuestion, CheckCircle2 } from 'lucide-react';
import { type IQAQuestion, type QAQuestionStatus } from '@eventpulse/shared-types';
import { Avatar } from '@/components/atoms/Avatar.js';
import { Badge } from '@/components/atoms/Badge.js';
import { Button } from '@/components/atoms/Button.js';
import { Spinner } from '@/components/atoms/Spinner.js';
import { formatRelative } from '@/lib/utils.js';

interface QAPanelProps {
  questions: IQAQuestion[];
  isLoading: boolean;
  onAsk: (content: string) => void;
  onUpvote: (questionId: string) => void;
  onAnswer?: (questionId: string, content: string) => void;
  isOrganizer?: boolean;
  currentUserId?: string;
}

const STATUS_BADGE: Record<QAQuestionStatus, { variant: 'primary' | 'success' | 'warning' | 'neutral'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  approved: { variant: 'primary', label: 'Open' },
  answered: { variant: 'success', label: 'Answered' },
  rejected: { variant: 'neutral', label: 'Rejected' },
};

export function QAPanel({
  questions,
  isLoading,
  onAsk,
  onUpvote,
  onAnswer,
  isOrganizer = false,
  currentUserId,
}: QAPanelProps): JSX.Element {
  const [newQuestion, setNewQuestion] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  function handleAsk(e: FormEvent): void {
    e.preventDefault();
    const trimmed = newQuestion.trim();
    if (!trimmed) return;
    onAsk(trimmed);
    setNewQuestion('');
  }

  function handleAnswer(questionId: string): void {
    const trimmed = answerText.trim();
    if (!trimmed || !onAnswer) return;
    onAnswer(questionId, trimmed);
    setAnsweringId(null);
    setAnswerText('');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const sorted = [...questions].sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));

  return (
    <div className="space-y-6">
      <form onSubmit={handleAsk} className="flex gap-3">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 input-field"
        />
        <Button type="submit" variant="primary" disabled={!newQuestion.trim()}>
          Ask
        </Button>
      </form>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-secondary-500">
          <MessageCircleQuestion className="mb-2 h-10 w-10" />
          <p className="text-sm">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sorted.map((q) => {
            const status = STATUS_BADGE[q.status];
            const hasUpvoted = q.upvotedBy?.includes(currentUserId ?? '');
            return (
              <li key={q.id} className="rounded-xl border border-secondary-200 bg-white p-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => onUpvote(q.id)}
                      className={`rounded-lg p-1 transition ${
                        hasUpvoted
                          ? 'bg-primary-100 text-primary-600'
                          : 'text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600'
                      }`}
                      aria-label="Upvote question"
                    >
                      <ChevronUp className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-semibold text-secondary-700">
                      {q.upvotes ?? 0}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="text-xs text-secondary-400">
                        {formatRelative(q.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-800">{q.content}</p>

                    {q.answer && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-success-50 p-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-success-600 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-success-700 mb-1">
                            Answered by organizer
                          </p>
                          <p className="text-sm text-success-800">{q.answer.content}</p>
                        </div>
                      </div>
                    )}

                    {isOrganizer && q.status !== 'answered' && (
                      <>
                        {answeringId === q.id ? (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              placeholder="Write an answer..."
                              className="flex-1 input-field"
                            />
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleAnswer(q.id)}
                              disabled={!answerText.trim()}
                            >
                              Reply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAnsweringId(null);
                                setAnswerText('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAnsweringId(q.id)}
                            className="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700"
                          >
                            Answer this question
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
