import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  HelpCircle,
  AlertOctagon,
  ArrowRight,
  Loader2,
  FileQuestion
} from 'lucide-react';
import { AnswerPractice } from './AnswerPractice.jsx';

export const InterviewQuestionCard = ({
  question,
  index,
  targetRole,
  targetCompany,
  isBookmarked,
  onToggleBookmark,
  onAskCoach,
  onSubmitAnswer,
  onGenerateFollowUp
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [followUpsList, setFollowUpsList] = useState(question.followUps || []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateFollowUp = async () => {
    if (loadingFollowUp) return;
    setLoadingFollowUp(true);
    try {
      const results = await onGenerateFollowUp({
        question: question.question,
        role: targetRole,
        company: targetCompany
      });
      if (Array.isArray(results) && results.length > 0) {
        setFollowUpsList(results);
      }
    } catch (err) {
      console.error('Follow-up generation failed:', err);
    } finally {
      setLoadingFollowUp(false);
    }
  };

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'medium').toLowerCase();
    if (d === 'easy') {
      return <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Easy</span>;
    }
    if (d === 'hard') {
      return <span className="rounded bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-800">Hard</span>;
    }
    return <span className="rounded bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800">Medium</span>;
  };

  const getCategoryBadge = (cat) => {
    const c = (cat || 'technical').replace(/_/g, ' ').toUpperCase();
    return <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{c}</span>;
  };

  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
      {/* Top Meta Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">
            Question {String(index + 1).padStart(2, '0')}
          </span>
          {getCategoryBadge(question.category)}
          {getDifficultyBadge(question.difficulty)}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleBookmark(question.id || question.question)}
            className="focus-ring rounded p-1 text-slate-400 hover:text-amber-500"
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
          >
            {isBookmarked ? (
              <BookmarkCheck size={18} className="text-amber-500 fill-amber-500" />
            ) : (
              <Bookmark size={18} />
            )}
          </button>
          <button
            onClick={() => handleCopy(`${question.question}\n\nSuggested Answer:\n${question.suggestedAnswer}`)}
            className="focus-ring rounded p-1 text-slate-400 hover:text-slate-700"
            title="Copy question and answer"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Grounding Context Snippet */}
      {question.context && (
        <p className="mt-2 text-xs font-medium text-brand">
          ✦ {question.context}
        </p>
      )}

      {/* Main Question Text */}
      <h3 className="mt-2 text-base font-semibold text-ink leading-snug">
        {question.question}
      </h3>

      {/* Interactive Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setShowAnswer(!showAnswer);
            if (!showAnswer) setShowPractice(false);
          }}
          className={`focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
            showAnswer
              ? 'bg-slate-200 text-slate-800'
              : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          {showAnswer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showAnswer ? 'Hide Answer' : 'Show Answer'}
        </button>

        <button
          onClick={() => {
            setShowPractice(!showPractice);
            if (!showPractice) setShowAnswer(false);
          }}
          className={`focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
            showPractice
              ? 'bg-brand text-white'
              : 'border border-teal-200 bg-teal-50 text-brand hover:bg-teal-100'
          }`}
        >
          <MessageSquare size={13} />
          {showPractice ? 'Close Practice' : 'Practice Answer'}
        </button>

        <button
          onClick={() => onAskCoach(question)}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        >
          <Sparkles size={13} className="text-brand" />
          Ask AI Coach
        </button>

        <button
          onClick={handleGenerateFollowUp}
          disabled={loadingFollowUp}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          {loadingFollowUp ? (
            <Loader2 size={13} className="animate-spin text-brand" />
          ) : (
            <ArrowRight size={13} className="text-slate-500" />
          )}
          Generate Follow-up
        </button>
      </div>

      {/* Accordion: Suggested Answer Section */}
      {showAnswer && (
        <div className="mt-4 space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Suggested Answer</span>
              <button
                onClick={() => handleCopy(question.suggestedAnswer)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
              {question.suggestedAnswer}
            </p>
          </div>

          {/* Why Interviewer Asks This */}
          {question.whyAsked && (
            <div className="border-t border-slate-200/80 pt-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <HelpCircle size={14} className="text-teal-600" /> Why the interviewer may ask this:
              </p>
              <p className="mt-1 text-xs text-slate-600">{question.whyAsked}</p>
            </div>
          )}

          {/* Key Points to Mention */}
          {question.keyPoints?.length > 0 && (
            <div className="border-t border-slate-200/80 pt-3">
              <p className="text-xs font-semibold text-slate-700">Key Points to Mention:</p>
              <ul className="mt-1.5 space-y-1 pl-5 text-xs text-slate-600 list-disc">
                {question.keyPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {question.commonMistake && (
            <div className="border-t border-slate-200/80 pt-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
                <AlertOctagon size={14} className="text-rose-600" /> Common Mistakes:
              </p>
              <p className="mt-1 text-xs text-rose-700">{question.commonMistake}</p>
            </div>
          )}
        </div>
      )}

      {/* Practice Answer Mode */}
      {showPractice && (
        <AnswerPractice
          question={question}
          targetRole={targetRole}
          targetCompany={targetCompany}
          onSubmitAnswer={onSubmitAnswer}
          onShowSuggested={() => {
            setShowPractice(false);
            setShowAnswer(true);
          }}
        />
      )}

      {/* Follow-up Questions Pill List */}
      {followUpsList?.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Likely Follow-up Questions:
          </p>
          <div className="mt-2 space-y-1.5">
            {followUpsList.map((fu, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700"
              >
                <ArrowRight size={13} className="shrink-0 mt-0.5 text-brand" />
                <span>{fu}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
