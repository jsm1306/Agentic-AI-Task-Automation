import React from 'react';
import { Pin, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toLocaleTime } from '../../lib/dates';

interface MessageBubbleProps {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  tools?: string[];
  pinned?: boolean;
  onPin: () => void;
  isStreaming?: boolean;
  artifact?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  id,
  type,
  content,
  timestamp,
  tools,
  pinned = false,
  onPin,
  isStreaming = false,
  artifact,
}) => {
  const isUser = type === 'user';

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const { parseToDate } = require('../../lib/dates');
    const parsed = parseToDate(timestamp);
    if (parsed) return toLocaleTime(timestamp, { hour: '2-digit', minute: '2-digit' });
    return timestamp; // already formatted
  };

  const tsText = formatTimestamp(timestamp);

  return (
    <div className={`flex gap-3 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center flex-shrink-0 neon-border-violet">
          <Bot className="w-4 h-4 text-cyan-400" />
        </div>
      )}
      <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`rounded-2xl px-5 py-4 backdrop-blur-xl ${
            isUser
              ? 'glass-card neon-border-cyan text-white shadow-2xl'
              : `glass-card-violet neon-border-violet text-zinc-100 shadow-2xl ${isStreaming ? 'animate-pulse border-violet-400/60' : ''}`
          } animate-fade-in-up`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
          ) : (
            <>
              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-cyan-300 prose-strong:text-cyan-200 prose-code:text-cyan-100 prose-code:bg-zinc-800/50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:border prose-code:border-zinc-600 prose-p:leading-relaxed prose-ul:space-y-2 prose-li:text-zinc-200">
                <ReactMarkdown>
                  {content}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1"></span>
                )}
              </div>
              {artifact && (
                <div className="mt-4 p-4 glass-card neon-border-cyan rounded-lg">
                  <div className="text-sm text-cyan-300 font-medium mb-2">📝 Generated Notes</div>
                  <div className="text-zinc-200 whitespace-pre-wrap text-sm leading-relaxed">
                    {artifact}
                  </div>
                </div>
              )}
            </>
          )}
          {tools && tools.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tools.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs glass-card neon-border-cyan rounded-full text-cyan-300 font-medium"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 mt-2 text-xs text-zinc-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {tsText ? <span className="opacity-70">{tsText}</span> : null}
          <button
            onClick={onPin}
            className={`p-1.5 rounded-full glass-card hover-glow transition-all duration-300 ${
              pinned ? 'text-cyan-400 neon-glow-cyan' : 'text-zinc-500 hover:text-cyan-400'
            }`}
          >
            <Pin className="w-3 h-3" />
          </button>
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center flex-shrink-0 order-2 neon-border-cyan">
          <User className="w-4 h-4 text-cyan-400" />
        </div>
      )}
    </div>
  );
};