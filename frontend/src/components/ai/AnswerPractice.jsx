import { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, Lightbulb, MessageSquare, ArrowRight } from 'lucide-react';

export const AnswerPractice = ({
  question,
  targetRole,
  targetCompany,
  onSubmitAnswer,
  onShowSuggested
}) => {
  const [studentAnswer, setStudentAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [evalError, setEvalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentAnswer.trim() || evaluating) return;

    setEvaluating(true);
    setEvalError('');
    try {
      const result = await onSubmitAnswer({
        question: question.question,
        studentAnswer: studentAnswer.trim(),
        role: targetRole,
        company: targetCompany
      });
      setFeedback(result);
    } catch (err) {
      setEvalError(err.response?.data?.message || err.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const getOverallBadge = (overall) => {
    switch (overall) {
      case 'Strong':
        return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Strong Answer</span>;
      case 'Good':
        return <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">Good Answer</span>;
      default:
        return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Needs Improvement</span>;
    }
  };

  return (
    <div className="mt-4 rounded-md border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Practice Speaking / Answering</h4>
        {onShowSuggested && (
          <button
            type="button"
            onClick={onShowSuggested}
            className="text-xs font-medium text-brand hover:underline"
          >
            Show Suggested Answer Instead
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3">
        <textarea
          rows={4}
          required
          value={studentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          placeholder="Type your answer as if you are speaking to the interviewer in the room..."
          className="focus-ring w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-ink placeholder:text-slate-400"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-400">{studentAnswer.length} characters</span>
          <button
            type="submit"
            disabled={evaluating || !studentAnswer.trim()}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {evaluating ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Evaluating...
              </>
            ) : (
              <>
                <Send size={14} /> Submit Answer
              </>
            )}
          </button>
        </div>
      </form>

      {evalError && (
        <p className="mt-3 text-xs text-rose-600">{evalError}</p>
      )}

      {/* AI Evaluation Feedback Card */}
      {feedback && (
        <div className="mt-5 space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-bold text-ink">AI Evaluation & Coaching</span>
            {getOverallBadge(feedback.overall)}
          </div>

          {/* What Worked */}
          {feedback.whatWorked?.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <CheckCircle size={14} className="text-emerald-600" /> What Worked Well:
              </p>
              <ul className="mt-1.5 space-y-1 pl-5 text-xs text-slate-700 list-disc">
                {feedback.whatWorked.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Points */}
          {feedback.missingPoints?.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <AlertCircle size={14} className="text-amber-600" /> Key Missing Elements:
              </p>
              <ul className="mt-1.5 space-y-1 pl-5 text-xs text-slate-700 list-disc">
                {feedback.missingPoints.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Improvements */}
          {feedback.improvements?.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Lightbulb size={14} className="text-amber-500" /> Recommended Improvements:
              </p>
              <ul className="mt-1.5 space-y-1 pl-5 text-xs text-slate-700 list-disc">
                {feedback.improvements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Better Sample Answer */}
          {feedback.suggestedAnswer && (
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-700">Better Sample Answer (STAR Method):</p>
              <p className="mt-1 text-xs text-slate-700 whitespace-pre-line leading-relaxed italic">
                &ldquo;{feedback.suggestedAnswer}&rdquo;
              </p>
            </div>
          )}

          {/* Follow-up Question */}
          {feedback.followUpQuestion && (
            <div className="rounded-md border border-teal-100 bg-teal-50/50 p-3">
              <p className="flex items-center gap-1 text-xs font-semibold text-brand">
                <MessageSquare size={13} /> Likely Next Follow-up from Interviewer:
              </p>
              <p className="mt-1 text-xs font-medium text-slate-800">
                &ldquo;{feedback.followUpQuestion}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
