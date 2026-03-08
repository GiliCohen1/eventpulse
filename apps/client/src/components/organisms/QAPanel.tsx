import { useState, type FormEvent } from 'react';
import { ChevronUp, MessageCircleQuestion, CheckCircle2 } from 'lucide-react';
import { type IQAQuestion, type QAQuestionStatus } from '@eventpulse/shared-types';
import { Badge } from '@/components/atoms/Badge.js';
import { Button } from '@/components/atoms/Button.js';
import { Spinner } from '@/components/atoms/Spinner.js';
import { formatRelative, classNames } from '@/lib/utils.js';
import { t } from '@/lib/i18n.js';

interface QAPanelProps {
  questions: IQAQuestion[];
  isLoading: boolean;
  onAsk: (content: string) => void;
  onUpvote: (questionId: string) => void;
  onAnswer?: (questionId: string, content: string) => void;
  isOrganizer?: boolean;
  currentUserId?: string;
}

const STATUS_BADGE: Record<
  QAQuestionStatus,
  { variant: 'primary' | 'success' | 'warning' | 'neutral'; labelKey: string }
> = {
  pending: { variant: 'warning', labelKey: 'qa.statusPending' },
  answered: { variant: 'success', labelKey: 'qa.statusAnswered' },
  dismissed: { variant: 'neutral', labelKey: 'qa.statusDismissed' },
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

  const sorted = [...questions].sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0));

  return (
    <div className="space-y-6">
      <form onSubmit={handleAsk} className="flex gap-3">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder={t('qa.askPlaceholder')}
          className="flex-1 input-field"
        />
        <Button type="submit" variant="primary" disabled={!newQuestion.trim()}>
          {t('qa.ask')}
        </Button>
      </form>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-secondary-500">
          <MessageCircleQuestion className="mb-2 h-10 w-10" />
          <p className="text-sm">{t('qa.empty')}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sorted.map((q) => {
            const status = STATUS_BADGE[q.status];
            const hasUpvoted = q.upvotes?.includes(currentUserId ?? '');
            return (
              <li key={q.id} className="rounded-xl border border-secondary-200 bg-white p-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => onUpvote(q.id)}
                      className={classNames(
                        'rounded-lg p-1 transition',
                        hasUpvoted
                          ? 'bg-primary-100 text-primary-600'
                          : 'text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600',
                      )}
                      aria-label={t('qa.upvote')}
                    >
                      <ChevronUp className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-semibold text-secondary-700">
                      {q.upvotes ?? 0}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant={status.variant}>{t(status.labelKey)}</Badge>
                      <span className="text-xs text-secondary-400">
                        {formatRelative(q.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-800">{q.question}</p>

                    {q.answer && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-success-50 p-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-success-600 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-success-700 mb-1">
                            {t('qa.answeredBy')}
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
                              placeholder={t('qa.answerPlaceholder')}
                              className="flex-1 input-field"
                            />
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleAnswer(q.id)}
                              disabled={!answerText.trim()}
                            >
                              {t('qa.reply')}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAnsweringId(null);
                                setAnswerText('');
                              }}
                            >
                              {t('common.cancel')}
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAnsweringId(q.id)}
                            className="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700"
                          >
                            {t('qa.answerThis')}
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
