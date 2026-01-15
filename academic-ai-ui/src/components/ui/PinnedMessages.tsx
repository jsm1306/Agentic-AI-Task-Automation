'use client';

import React from 'react';
import { Pin, X } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  pinned: boolean;
  tools?: string[];
}

interface PinnedMessagesProps {
  messages: Message[];
  onUnpin: (id: string) => void;
}

export const PinnedMessages: React.FC<PinnedMessagesProps> = ({ messages, onUnpin }) => {
  return (
    <div className="bg-cyan-500/10 border-b border-cyan-500/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Pin className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-cyan-400">Pinned Messages</span>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-2 p-2 bg-black/40 rounded border border-cyan-500/20">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{message.content}</p>
              <span className="text-xs text-zinc-400">{message.timestamp}</span>
            </div>
            <button
              onClick={() => onUnpin(message.id)}
              className="text-zinc-400 hover:text-cyan-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};