'use client';

import React, { useState, useMemo } from 'react';
import { Plus, MessageSquare, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatSession as ChatSessionComponent } from '../ui/ChatSession';
import { ChatSession } from '../../lib/api';

const mockSessions: ChatSession[] = [
  { 
    id: '1', 
    title: 'Object Detection Basics', 
    subject: 'Computer Vision',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    messages: [],
    artifacts: { study_plans: [], notes: [], progress: [], memory: {} }
  },
  { 
    id: '2', 
    title: 'CNN Architecture Discussion', 
    subject: 'Deep Learning',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    messages: [],
    artifacts: { study_plans: [], notes: [], progress: [], memory: {} }
  },
  { 
    id: '3', 
    title: 'Training Pipeline Setup', 
    subject: 'Machine Learning',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    messages: [],
    artifacts: { study_plans: [], notes: [], progress: [], memory: {} }
  },
  { 
    id: '4', 
    title: 'Advanced CV Techniques', 
    subject: 'Computer Vision',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    messages: [],
    artifacts: { study_plans: [], notes: [], progress: [], memory: {} }
  },
  { 
    id: '5', 
    title: 'Model Optimization', 
    subject: 'Performance',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    messages: [],
    artifacts: { study_plans: [], notes: [], progress: [], memory: {} }
  },
];

const groupSessions = (sessions: ChatSession[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    today: sessions.filter(s => new Date(s.created_at) >= today),
    thisWeek: sessions.filter(s => {
      const date = new Date(s.created_at);
      return date >= weekAgo && date < today;
    }),
    older: sessions.filter(s => new Date(s.created_at) < weekAgo)
  };
};

export const ChatSidebar: React.FC = () => {
  const [sessions, setSessions] = useState(mockSessions);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({ today: true, thisWeek: true, older: false });

  const filteredSessions = useMemo(() => {
    const filtered = sessions.filter(session =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return groupSessions(filtered);
  }, [sessions, searchQuery]);

  const addNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Session',
      subject: 'General',
      created_at: new Date().toISOString(),
      messages: [],
      artifacts: { study_plans: [], notes: [], progress: [], memory: {} }
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const toggleGroup = (group: keyof typeof expandedGroups) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const renderGroup = (title: string, sessions: ChatSession[], groupKey: keyof typeof expandedGroups) => {
    if (sessions.length === 0) return null;

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleGroup(groupKey)}
          className="flex items-center gap-2 w-full px-2 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          {expandedGroups[groupKey] ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          {title} ({sessions.length})
        </button>
        {expandedGroups[groupKey] && (
          <div className="mt-2 space-y-1">
            {sessions.map((session) => (
              <ChatSessionComponent key={session.id} {...session} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-black/80 backdrop-blur-md border-r border-cyan-500/20 flex flex-col">
      <div className="p-4 border-b border-cyan-500/20 space-y-3">
        <button
          onClick={addNewSession}
          className="w-full flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-black/40 border border-cyan-500/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {renderGroup('Today', filteredSessions.today, 'today')}
        {renderGroup('This Week', filteredSessions.thisWeek, 'thisWeek')}
        {renderGroup('Older', filteredSessions.older, 'older')}
      </div>
    </div>
  );
};