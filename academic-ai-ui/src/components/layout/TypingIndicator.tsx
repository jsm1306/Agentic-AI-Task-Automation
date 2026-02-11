import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3 justify-start animate-fade-in-up">
      <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center flex-shrink-0 neon-border-violet">
        <Bot className="w-4 h-4 text-cyan-400" />
      </div>
      <div className="max-w-[70%]">
        <div className="glass-card-violet neon-border-violet rounded-2xl px-5 py-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="text-sm text-cyan-300 font-medium">AI is processing...</span>
          </div>
        </div>
      </div>
    </div>
  );
};