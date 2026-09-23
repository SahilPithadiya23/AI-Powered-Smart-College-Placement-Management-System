import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Sparkles, Filter, Bookmark, RefreshCw, Layers } from 'lucide-react';
import { api } from '../services/api.js';
import { ResumeContextCard } from '../components/ai/ResumeContextCard.jsx';
import { InterviewConfig } from '../components/ai/InterviewConfig.jsx';
import { InterviewQuestionCard } from '../components/ai/InterviewQuestionCard.jsx';
import { AIChatbot } from '../components/ai/AIChatbot.jsx';
import { AIEmptyState } from '../components/ai/AIEmptyState.jsx';

export const AnalyticsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const isStudent = user?.role === 'student';

  // Branch placements chart state
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  // Resume context & readiness state
  const [interviewContext, setInterviewContext] = useState(null);
  const [contextReadiness, setContextReadiness] = useState(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [contextError, setContextError] = useState(false);

  // Interview config state
  const [config, setConfig] = useState({
    role: 'Software Engineer',
    company: '',
    questionType: 'all',
    difficulty: 'mixed',
    count: 10
  });

  // Question generation states
  const [generating, setGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('idle'); // idle | analyzing | generating | ready
  const [questions, setQuestions] = useState([]);
  const [generationError, setGenerationError] = useState('');

  // UI filters & bookmarks
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedQuestionForChat, setSelectedQuestionForChat] = useState(null);

  // Load branch placements
  useEffect(() => {
    api
      .get('/analytics/branch-placements')
      .then(({ data }) => {
        setBranches(
          (data.data || []).map((item) => ({
            branch: item._id || 'NA',
            placed: item.placed,
            total: item.total
          }))
        );
      })
      .catch((err) => console.error('Failed to load branch placements:', err))
      .finally(() => setLoadingBranches(false));
  }, []);

  // Load student interview context if student
  const fetchInterviewContext = async () => {
    if (!isStudent) return;
    setLoadingContext(true);
    setContextError(false);
    try {
      const { data } = await api.get('/analytics/interview-context');
      setInterviewContext({
        student: data.student,
        resume: data.resume
      });
      setContextReadiness(data.contextReadiness);
    } catch (err) {
      console.error('Failed to load interview context:', err);
      setContextError(true);
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    fetchInterviewContext();
  }, [isStudent]);

  // Handle question generation
  const handleGenerateQuestions = async () => {
    setGenerating(true);
    setGenerationError('');
    setGenerationStage('analyzing');

    try {
      // Small simulated delay for stage clarity
      setTimeout(() => {
        setGenerationStage('generating');
      }, 700);

      const { data } = await api.post('/analytics/interview-prep', config);
      setQuestions(data.questions || []);
      setGenerationStage('ready');

      setTimeout(() => {
        setGenerationStage('idle');
      }, 2500);
    } catch (err) {
      console.error('Question generation failed:', err);
      setGenerationError(err.response?.data?.message || 'Failed to generate interview questions. Please try again.');
      setGenerationStage('idle');
    } finally {
      setGenerating(false);
    }
  };

  // Answer evaluation handler
  const handleEvaluateAnswer = async (payload) => {
    const { data } = await api.post('/analytics/interview-answer', payload);
    return data.feedback;
  };

  // Follow-up generation handler
  const handleGenerateFollowUp = async (payload) => {
    const { data } = await api.post('/analytics/interview-followup', payload);
    return data.followUps;
  };

  // Chat message handler
  const handleSendChatMessage = async (payload) => {
    const { data } = await api.post('/analytics/ai/chat', payload);
    return data;
  };

  // Bookmark toggle
  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const qId = q.id || q.question;
      if (showOnlyBookmarked && !bookmarkedIds.has(qId)) return false;
      if (activeCategoryFilter !== 'all') {
        const cat = (q.category || '').toLowerCase();
        if (activeCategoryFilter === 'technical' && !cat.includes('tech')) return false;
        if (activeCategoryFilter === 'resume_based' && !cat.includes('resume')) return false;
        if (activeCategoryFilter === 'project_based' && !cat.includes('project')) return false;
        if (activeCategoryFilter === 'behavioral' && !cat.includes('behavioral') && !cat.includes('hr')) return false;
      }
      return true;
    });
  }, [questions, activeCategoryFilter, showOnlyBookmarked, bookmarkedIds]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Section: Branch-wise Placements & Context Card */}
      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_460px] 2xl:grid-cols-[minmax(0,2.3fr)_1fr] items-start">
        {/* Existing Functional Branch-wise Placements Chart */}
        <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Branch-wise Placements</h2>
              <p className="text-xs text-slate-500">Distribution of placed vs eligible students across departments.</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#0f766e]" /> Placed
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#c2410c]" /> Total
              </span>
            </div>
          </div>

          <div className="mt-4 h-72">
            {loadingBranches ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Loading placement analytics...
              </div>
            ) : branches.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No placement data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branches} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="branch" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="placed" fill="#0f766e" radius={[4, 4, 0, 0]} name="Placed Students" />
                  <Bar dataKey="total" fill="#c2410c" radius={[4, 4, 0, 0]} name="Total Registered" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* AI Interview Coach Status Card */}
        {isStudent ? (
          <ResumeContextCard
            context={interviewContext}
            readiness={contextReadiness}
            loading={loadingContext}
            error={contextError}
            onRefresh={fetchInterviewContext}
          />
        ) : (
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <h3 className="text-base font-semibold text-ink">Recruitment Analytics Overview</h3>
            <p className="mt-2 text-sm text-slate-600">
              Departmental hiring trends, drive performance metrics, and batch conversion ratios.
            </p>
          </div>
        )}
      </div>

      {/* Main Student AI Interview Coach Section */}
      {isStudent && (
        <section className="space-y-6">
          {/* Interview Configuration Panel */}
          <InterviewConfig
            config={config}
            onChange={setConfig}
            onGenerate={handleGenerateQuestions}
            generating={generating}
            generationStage={generationStage}
          />

          {/* Error Message if Generation Fails */}
          {generationError && (
            <AIEmptyState type="error" errorMessage={generationError} onRetry={handleGenerateQuestions} />
          )}

          {/* Generated Questions Workspace */}
          {questions.length > 0 ? (
            <div className="space-y-4">
              {/* Question Workspace Filter & Control Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
                    <Filter size={13} /> Filter:
                  </span>
                  {[
                    { id: 'all', label: 'All Questions' },
                    { id: 'technical', label: 'Technical' },
                    { id: 'resume_based', label: 'Resume Grounded' },
                    { id: 'project_based', label: 'Projects' },
                    { id: 'behavioral', label: 'HR / Behavioral' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategoryFilter(tab.id)}
                      className={`focus-ring rounded-md px-2.5 py-1 font-medium transition ${
                        activeCategoryFilter === tab.id
                          ? 'bg-brand text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                    className={`focus-ring inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${
                      showOnlyBookmarked
                        ? 'bg-amber-100 text-amber-800'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark size={13} className={showOnlyBookmarked ? 'fill-amber-500 text-amber-500' : ''} />
                    <span>Saved ({bookmarkedIds.size})</span>
                  </button>
                  <span className="text-slate-400">
                    Showing {filteredQuestions.length} of {questions.length}
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    No questions match the selected filter.
                  </div>
                ) : (
                  filteredQuestions.map((question, idx) => (
                    <InterviewQuestionCard
                      key={question.id || idx}
                      question={question}
                      index={idx}
                      targetRole={config.role}
                      targetCompany={config.company}
                      isBookmarked={bookmarkedIds.has(question.id || question.question)}
                      onToggleBookmark={toggleBookmark}
                      onAskCoach={(q) => {
                        setSelectedQuestionForChat(q);
                        setIsChatOpen(true);
                      }}
                      onSubmitAnswer={handleEvaluateAnswer}
                      onGenerateFollowUp={handleGenerateFollowUp}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            !generating && !generationError && (
              <AIEmptyState
                type={!contextReadiness?.hasResume ? 'no_resume' : 'no_questions'}
                onRetry={handleGenerateQuestions}
              />
            )
          )}

          {/* Interactive AI Placement Coach Chatbot */}
          <AIChatbot
            studentName={interviewContext?.student?.name || user?.name || 'Aum'}
            studentContext={interviewContext}
            activeRole={config.role}
            activeCompany={config.company}
            selectedQuestion={selectedQuestionForChat}
            onSendMessage={handleSendChatMessage}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            onToggle={() => setIsChatOpen(!isChatOpen)}
          />
        </section>
      )}
    </div>
  );
};
