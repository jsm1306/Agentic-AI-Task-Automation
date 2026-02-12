import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { ChatSession as ChatSessionType } from '../../lib/api';
import { parseToDate } from '../../lib/dates';

interface ChatSessionProps extends ChatSessionType {
  onClick?: () => void;
  onDelete?: () => void;
  isActive?: boolean;
}

export const ChatSession: React.FC<ChatSessionProps> = ({ title, created_at, onClick, onDelete, isActive = false }) => {
  const formatTimestamp = (dateString: string) => {
    const date = parseToDate(dateString) || new Date(dateString);
    if (!date || isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onClick}
      className={`group p-3 rounded-lg cursor-pointer transition-all duration-300 mb-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/30 hover-glow ${
        isActive
          ? 'glass-card neon-border-cyan shadow-xl shadow-cyan-500/30 neon-glow-cyan'
          : 'glass-card border border-transparent hover:border-cyan-500/40 hover:neon-glow-cyan'
      }`}
    >
      <div className="flex items-start gap-2">
        <MessageSquare className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0 group-hover:text-cyan-300 transition-colors" />
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-medium truncate group-hover:text-cyan-100 transition-colors">{title}</h3>
          <p className="text-zinc-400 text-xs group-hover:text-zinc-300 transition-colors">{formatTimestamp(created_at)}</p>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-zinc-500 hover:text-red-400 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hover:rotate-12"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};