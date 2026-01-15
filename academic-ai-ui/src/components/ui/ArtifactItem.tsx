'use client';

import React, { useState } from 'react';
import { Download, Copy, Eye, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

interface ArtifactItemProps {
  id: string;
  title: string;
  content: string;
  type: string;
  timestamp?: string;
  editable?: boolean;
}

export const ArtifactItem: React.FC<ArtifactItemProps> = ({ title, content, type, timestamp, editable = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
  };

  return (
    <div className="bg-black/40 border border-cyan-500/20 rounded-lg overflow-hidden">
      <div
        className="p-3 cursor-pointer hover:bg-cyan-500/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white text-sm font-medium truncate">{title}</h3>
          <div className="flex items-center gap-2">
            {timestamp && <span className="text-xs text-zinc-400">{timestamp}</span>}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-cyan-400" />
            )}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-cyan-500/20">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 bg-black/50 border border-cyan-500/30 rounded text-white text-sm resize-none"
              rows={6}
            />
          ) : (
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{content}</p>
          )}
          <div className="flex gap-2 mt-3">
            {editable && (
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                {isEditing ? 'Save' : 'Edit'}
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};