import { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';

export const ChatMessage = ({ message }) => {
  const isAI = message.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Headers (### Header)
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-ink mt-2 mb-1 text-sm">
            {trimmed.slice(4)}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-bold text-ink mt-2.5 mb-1 text-sm">
            {trimmed.slice(3)}
          </h3>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        const text = trimmed.slice(2);
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-2 my-0.5">
            <span className="text-brand font-bold">•</span>
            <span className="leading-relaxed">{renderBoldText(text)}</span>
          </div>
        );
      }

      // Standard line
      return (
        <p key={idx} className="leading-relaxed my-0.5">
          {renderBoldText(trimmed)}
        </p>
      );
    });
  };

  const renderBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const timeString = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex gap-3 text-xs sm:text-sm ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isAI ? 'bg-teal-100 text-brand' : 'bg-slate-200 text-slate-700'
        }`}
      >
        {isAI ? <Bot size={16} /> : <User size={16} />}
      </div>

      <div className={`group relative max-w-[85%] rounded-lg p-3.5 shadow-sm ${
        isAI
          ? 'bg-white border border-slate-200 text-slate-800'
          : 'bg-brand text-white'
      }`}>
        <div className="space-y-0.5 break-words">
          {isAI ? formatContent(message.content) : <p className="leading-relaxed">{message.content}</p>}
        </div>

        <div className={`mt-2 flex items-center gap-2 text-[10px] ${isAI ? 'text-slate-400' : 'text-teal-100 justify-end'}`}>
          {timeString && <span>{timeString}</span>}
          {isAI && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition focus-ring rounded p-0.5 hover:text-slate-700"
              title="Copy response"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
