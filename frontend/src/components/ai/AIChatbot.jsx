import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Trash2,
  Bot,
  Sparkles,
  Maximize2,
  Minimize2,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { ChatMessage } from './ChatMessage.jsx';

const DEFAULT_QUICK_ACTIONS = [
  'Explain My Resume',
  'Ask About My Project',
  'Create my introduction',
  'Why Should We Hire You?',
  'Tell Me About Yourself',
  'What are my strongest skills?',
  'Technical Question',
  'HR Question'
];

export const AIChatbot = ({
  studentName = 'Student',
  studentContext,
  activeRole,
  activeCompany,
  selectedQuestion,
  onSendMessage,
  isOpen,
  onClose,
  onToggle
}) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${studentName}! I am your AI Placement Coach. I can help you prepare for campus interviews, explain your projects, craft personal introductions, and refine your answers using your actual resume and placement profile.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState(DEFAULT_QUICK_ACTIONS);
  const [errorMessage, setErrorMessage] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  // When selectedQuestion changes from external card click
  useEffect(() => {
    if (selectedQuestion && isOpen) {
      const promptText = `How should I approach and answer this interview question: "${selectedQuestion.question}"?`;
      handleSendPrompt(promptText);
    }
  }, [selectedQuestion]);

  const handleSendPrompt = async (textToSend) => {
    const content = textToSend || input.trim();
    if (!content || loading) return;

    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await onSendMessage({
        messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        context: {
          role: activeRole,
          company: activeCompany,
          currentQuestion: selectedQuestion?.question || '',
          studentAnswer: selectedQuestion?.suggestedAnswer || ''
        }
      });

      const aiMessage = {
        role: 'assistant',
        content: response.message || 'I am ready to help you prepare.',
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (Array.isArray(response.suggestedActions) && response.suggestedActions.length > 0) {
        setSuggestedActions(response.suggestedActions);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat cleared. Ask me anything about your resume, project explanations, or interview preparation.`,
        timestamp: new Date().toISOString()
      }
    ]);
    setSuggestedActions(DEFAULT_QUICK_ACTIONS);
    setErrorMessage('');
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="focus-ring fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-800"
          aria-label="Open AI Placement Coach"
        >
          <Bot size={20} />
          <span>AI Coach</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
        </button>
      )}

      {/* Chat Window Panel / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-white border border-slate-200 shadow-2xl transition-all duration-200 sm:rounded-lg ${
            isExpanded
              ? 'inset-4 sm:inset-6'
              : 'bottom-4 right-4 w-full sm:w-[440px] h-[600px] max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:rounded-t-lg">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                  AI Placement Coach
                  <span className="rounded bg-teal-100 px-1.5 py-0.2 text-[10px] font-semibold text-brand">
                    Active
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {activeRole || 'General'} {activeCompany ? `@ ${activeCompany}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <button
                onClick={handleClearChat}
                className="focus-ring rounded p-1.5 hover:bg-slate-200 hover:text-slate-800"
                title="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="focus-ring rounded p-1.5 hover:bg-slate-200 hover:text-slate-800 hidden sm:block"
                title={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={onClose}
                className="focus-ring rounded p-1.5 hover:bg-slate-200 hover:text-slate-800"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Actions Chips Bar */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-3 py-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
              <span className="text-[11px] font-medium text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" /> Quick:
              </span>
              {suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(action)}
                  disabled={loading}
                  className="focus-ring rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50/70 hover:text-brand transition disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-brand">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-2 shadow-sm">
                  <Loader2 size={13} className="animate-spin text-brand" />
                  <span>AI Coach is thinking...</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white p-3 sm:rounded-b-lg">
            <div className="relative flex items-end rounded-md border border-slate-300 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach anything... (Enter to send, Shift+Enter for new line)"
                className="w-full resize-none border-0 bg-transparent p-2.5 text-xs sm:text-sm text-ink focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => handleSendPrompt()}
                disabled={loading || !input.trim()}
                className="m-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 shrink-0"
                title="Send message"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Grounded in your resume & profile</span>
              <span>PlacementOS Coach</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
