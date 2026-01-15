import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { ChatSession as ChatSessionType } from '../../lib/api';

interface ChatSessionProps extends ChatSessionType {
  onClick?: () => void;
  onDelete?: () => void;
  isActive?: boolean;
}

export const ChatSession: React.FC<ChatSessionProps> = ({ title, created_at, onClick, onDelete, isActive = false }) => {
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
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
      className={`group p-3 rounded-lg cursor-pointer transition-all duration-300 mb-2 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 ${
        isActive
          ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
          : 'bg-black/40 border border-transparent hover:bg-cyan-500/10 hover:border-cyan-500/30'
      }`}
    >
      <div className="flex items-start gap-2">
        <MessageSquare className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-medium truncate">{title}</h3>
          <p className="text-zinc-400 text-xs">{formatTimestamp(created_at)}</p>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};