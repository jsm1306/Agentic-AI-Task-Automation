import React from 'react';
import { Pin } from 'lucide-react';
import { ToolCapsule } from './ToolCapsule';

interface MessageBubbleProps {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  pinned?: boolean;
  tools?: string[];
  onPin?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ type, content, timestamp, tools, pinned, onPin }) => {
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in group`}>
      <div className={`max-w-[70%] p-4 rounded-2xl backdrop-blur-md relative ${
        type === 'user'
          ? 'bg-cyan-500/20 border border-cyan-500/40 text-white'
          : 'bg-violet-500/10 border border-violet-500/30 text-white'
      }`}>
        {onPin && (
          <button
            onClick={onPin}
            className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
              pinned ? 'text-cyan-400' : 'text-zinc-400 hover:text-cyan-400'
            }`}
          >
            <Pin className={`w-3 h-3 ${pinned ? 'fill-current' : ''}`} />
          </button>
        )}
        <p className="text-sm leading-relaxed pr-6">{content}</p>
        {tools && tools.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tools.map((tool) => (
              <ToolCapsule key={tool} tool={tool} />
            ))}
          </div>
        )}
        <span className="text-xs text-zinc-400 mt-2 block">{timestamp}</span>
      </div>
    </div>
  );
};