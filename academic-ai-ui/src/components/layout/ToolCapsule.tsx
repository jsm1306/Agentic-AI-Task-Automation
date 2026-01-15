import React from 'react';
import { Wrench, FileText, Search, Brain, Zap } from 'lucide-react';

interface ToolCapsuleProps {
  tool: string;
  active?: boolean;
}

const getToolIcon = (tool: string) => {
  const lowerTool = tool.toLowerCase();
  if (lowerTool.includes('file') || lowerTool.includes('read')) return FileText;
  if (lowerTool.includes('search') || lowerTool.includes('query')) return Search;
  if (lowerTool.includes('think') || lowerTool.includes('reason')) return Brain;
  if (lowerTool.includes('execute') || lowerTool.includes('run')) return Zap;
  return Wrench;
};

const getToolColor = (tool: string) => {
  const lowerTool = tool.toLowerCase();
  if (lowerTool.includes('file') || lowerTool.includes('read')) return 'text-green-400 bg-green-500/10 border-green-500/20';
  if (lowerTool.includes('search') || lowerTool.includes('query')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  if (lowerTool.includes('think') || lowerTool.includes('reason')) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  if (lowerTool.includes('execute') || lowerTool.includes('run')) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
};

export const ToolCapsule: React.FC<ToolCapsuleProps> = ({ tool, active = false }) => {
  const Icon = getToolIcon(tool);
  const colorClass = getToolColor(tool);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium transition-all ${
      active ? colorClass : 'text-zinc-400 bg-zinc-800/30 border-zinc-700/30'
    }`}>
      <Icon className="w-3 h-3" />
      <span>{tool}</span>
    </div>
  );
};