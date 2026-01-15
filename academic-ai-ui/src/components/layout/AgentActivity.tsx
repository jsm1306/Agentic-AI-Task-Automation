import React from 'react';
import { Activity, FileText, Search, Brain, Zap } from 'lucide-react';

interface AgentAction {
  id: string;
  agent: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface AgentActivityProps {
  actions: AgentAction[];
}

const getActionIcon = (action: string) => {
  if (action.includes('search') || action.includes('query')) return Search;
  if (action.includes('file') || action.includes('read')) return FileText;
  if (action.includes('think') || action.includes('reason')) return Brain;
  if (action.includes('execute') || action.includes('run')) return Zap;
  return Activity;
};

const getActionColor = (action: string) => {
  if (action.includes('search') || action.includes('query')) return 'text-blue-400';
  if (action.includes('file') || action.includes('read')) return 'text-green-400';
  if (action.includes('think') || action.includes('reason')) return 'text-purple-400';
  if (action.includes('execute') || action.includes('run')) return 'text-yellow-400';
  return 'text-cyan-400';
};

export const AgentActivity: React.FC<AgentActivityProps> = ({ actions }) => {
  if (actions.length === 0) return null;

  return (
    <div className="border-t border-cyan-500/20 bg-black/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-cyan-300">Agent Activity</span>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {actions.slice(-10).map((action) => {
          const Icon = getActionIcon(action.action);
          const colorClass = getActionColor(action.action);

          return (
            <div
              key={action.id}
              className="flex items-start gap-3 p-2 bg-zinc-800/30 rounded border border-zinc-700/30"
            >
              <div className={`p-1 rounded ${colorClass}`}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">{action.agent}</span>
                  <span className="text-xs text-zinc-400">{action.timestamp}</span>
                </div>
                <div className="text-sm text-zinc-300">{action.action}</div>
                {action.details && (
                  <div className="text-xs text-zinc-400 mt-1 truncate">{action.details}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};