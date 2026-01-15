import React from 'react';
import { Search, FileText, Save, RefreshCw } from 'lucide-react';

const toolIcons = {
  'Search': Search,
  'Save Notes': FileText,
  'Update Progress': RefreshCw,
  'Planning': Search
};

interface ToolCapsuleProps {
  tool: string;
}

export const ToolCapsule: React.FC<ToolCapsuleProps> = ({ tool }) => {
  const Icon = toolIcons[tool as keyof typeof toolIcons] || Search;

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs text-cyan-400">
      <Icon className="w-3 h-3" />
      <span>{tool}</span>
    </div>
  );
};