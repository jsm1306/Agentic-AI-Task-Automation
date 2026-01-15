'use client';

import React, { useState } from 'react';
import { Download, Copy, Eye, ChevronDown, ChevronUp, Edit3, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ArtifactItemProps {
  id: string;
  title: string;
  content: string;
  type: string;
  timestamp?: string;
  editable?: boolean;
  onDelete?: (id: string) => void;
  sessionTitle?: string;
  sessionId?: string;
}

export const ArtifactItem: React.FC<ArtifactItemProps> = ({ id, title, content, type, timestamp, editable = false, onDelete, sessionTitle, sessionId }) => {
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed for preview
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  // Create preview text (first 200 characters)
  const previewText = content.length > 200 ? content.substring(0, 200) + '...' : content;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    // Strip markdown formatting for clean text download
    const cleanContent = content
      .replace(/^#+\s*/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();

    const blob = new Blob([cleanContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-black/40 border border-cyan-500/20 rounded-lg overflow-hidden">
      <div
        className="p-3 cursor-pointer hover:bg-cyan-500/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-sm font-medium truncate">{title}</h3>
            {sessionTitle && (
              <p className="text-xs text-zinc-500 truncate mt-0.5">From: {sessionTitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {timestamp && <span className="text-xs text-zinc-400">{timestamp}</span>}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-cyan-400" />
            )}
          </div>
        </div>
        {!isExpanded && (
          <div className="mt-2 text-xs text-zinc-400 line-clamp-2">
            {previewText}
          </div>
        )}
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
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-cyan-300 prose-strong:text-cyan-200 prose-code:text-cyan-100 prose-code:bg-zinc-800/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-zinc-600 mt-2">
              <ReactMarkdown>
                {content}
              </ReactMarkdown>
            </div>
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
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Always show download button even when collapsed */}
      {!isExpanded && (
        <div className="px-3 pb-3 flex justify-end">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      )}
    </div>
  );
};