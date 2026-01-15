import React from 'react';
import { Pin, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  tools?: string[];
  pinned?: boolean;
  onPin: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  id,
  type,
  content,
  timestamp,
  tools,
  pinned = false,
  onPin,
}) => {
  const isUser = type === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-cyan-400" />
        </div>
      )}
      <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-cyan-500/20 border border-cyan-500/30 text-white'
              : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-100'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-cyan-300 prose-strong:text-cyan-200 prose-code:text-cyan-100 prose-code:bg-zinc-800/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-zinc-600">
              <ReactMarkdown>
                {content}
              </ReactMarkdown>
            </div>
          )}
          {tools && tools.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tools.map((tool, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 mt-1 text-xs text-zinc-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{timestamp}</span>
          <button
            onClick={onPin}
            className={`p-1 rounded hover:bg-zinc-700/50 transition-colors ${
              pinned ? 'text-cyan-400' : 'text-zinc-500'
            }`}
          >
            <Pin className="w-3 h-3" />
          </button>
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 order-2">
          <User className="w-4 h-4 text-cyan-400" />
        </div>
      )}
    </div>
  );
};