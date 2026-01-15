import React from 'react';
import { Pin, X } from 'lucide-react';
import { ChatMessage } from '../../lib/api';

interface PinnedMessagesProps {
  messages: ChatMessage[];
  onUnpin: (id: string) => void;
}

export const PinnedMessages: React.FC<PinnedMessagesProps> = ({ messages, onUnpin }) => {
  if (messages.length === 0) return null;

  return (
    <div className="border-b border-cyan-500/20 bg-cyan-500/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Pin className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-cyan-300">Pinned Messages</span>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded border border-zinc-700/30"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm text-zinc-200 truncate">{message.content}</div>
              <div className="text-xs text-zinc-400">{new Date(message.timestamp).toLocaleTimeString()}</div>
            </div>
            <button
              onClick={() => onUnpin(message.id || index.toString())}
              className="p-1 rounded hover:bg-zinc-700/50 transition-colors text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};