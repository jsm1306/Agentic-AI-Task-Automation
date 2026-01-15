'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, MessageSquare, Search, ChevronDown, ChevronUp, BookOpen, FileText, TrendingUp, Brain, Download, Copy, Edit3, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ChatSession as ChatSessionComponent } from '../ui/ChatSession';
import { ArtifactItem } from '../ui/ArtifactItem';
import { ChatSession, apiClient } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { useSubject } from '../context/SubjectContext';

interface ArtifactItemData {
  id: string;
  title: string;
  content: string;
  type: string;
  timestamp: string;
  editable: boolean;
  sessionTitle?: string;
  sessionId?: string;
}

interface ArtifactsData {
  studyPlans: ArtifactItemData[];
  notes: ArtifactItemData[];
  progress: ArtifactItemData[];
  memory: ArtifactItemData[];
}

const mockSessions = [
  { id: '1', title: 'Object Detection Basics', timestamp: new Date(Date.now() - 1000 * 60 * 30), active: true }, // 30 min ago
  { id: '2', title: 'CNN Architecture Discussion', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), active: false }, // 2 hours ago
  { id: '3', title: 'Training Pipeline Setup', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), active: false }, // 1 day ago
  { id: '4', title: 'Advanced CV Techniques', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), active: false }, // 3 days ago
  { id: '5', title: 'Model Optimization', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), active: false }, // 1 week ago
];

const mockArtifacts = {
  studyPlans: [
    { id: '1', title: 'Object Detection Learning Path', content: 'Week 1: Basics\nWeek 2: CNNs\nWeek 3: YOLO\nWeek 4: Projects', type: 'study-plan', timestamp: '2024-01-15 14:30', editable: true },
    { id: '2', title: 'Advanced CV Techniques', content: 'Transfer Learning\nData Augmentation\nModel Optimization', type: 'study-plan', timestamp: '2024-01-15 13:15', editable: true }
  ],
  notes: [
    { id: '3', title: 'CNN Architecture Notes', content: 'Convolutional layers extract features...\nPooling reduces dimensions...\nFully connected for classification...', type: 'notes', timestamp: '2024-01-15 12:45', editable: true },
    { id: '4', title: 'Object Detection Metrics', content: 'IoU, mAP, Precision, Recall...', type: 'notes', timestamp: '2024-01-15 11:20', editable: true }
  ],
  progress: [
    { id: '5', title: 'Week 1 Progress', content: 'Completed: 80%\nTopics covered: Basics, CNN intro', type: 'progress', timestamp: '2024-01-15 10:30', editable: false },
    { id: '6', title: 'Current Status', content: 'Working on YOLO implementation\nNext: Evaluation metrics', type: 'progress', timestamp: '2024-01-15 09:15', editable: false }
  ],
  memory: [
    { id: '7', title: 'User Preferences', content: 'Prefers detailed explanations\nInterested in practical applications\nLearning pace: Moderate', type: 'memory', timestamp: '2024-01-15 08:00', editable: false },
    { id: '8', title: 'Session Context', content: 'Currently studying Object Detection\nPrevious topics: CNN basics\nNext planned: YOLO v3', type: 'memory', timestamp: '2024-01-14 16:45', editable: false }
  ]
};

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

interface UnifiedSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession | null) => void;
  artifactsRefreshTrigger?: number;
}

export const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({ isCollapsed, onToggleCollapse, currentSession, onSessionSelect, artifactsRefreshTrigger }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'artifacts'>('chat');
  const [artifactsTab, setArtifactsTab] = useState<'session' | 'global' | 'studyPlans' | 'notes' | 'progress' | 'memory'>('session');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({ today: true, thisWeek: true, older: false });
  const [artifacts, setArtifacts] = useState<ArtifactsData>(mockArtifacts);
  const [globalArtifacts, setGlobalArtifacts] = useState<ArtifactsData>(mockArtifacts);
  const [hasLoadedGlobal, setHasLoadedGlobal] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (artifactsTab === 'global' && !hasLoadedGlobal) {
      loadGlobalArtifacts();
    }
  }, [artifactsTab, hasLoadedGlobal]);

  const loadSessions = async () => {
    try {
      const sessionList = await apiClient.getSessions();
      setSessions(sessionList);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArtifact = async (artifactId: string) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Delete Artifact',
      message: 'Are you sure you want to delete this artifact? This action cannot be undone.',
      onConfirm: () => {
        setConfirmationDialog(null);
        // For now, just remove from local state
        // In a real implementation, this would call a backend API
        setArtifacts(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            updated[key as keyof ArtifactsData] = updated[key as keyof ArtifactsData].filter(
              artifact => artifact.id !== artifactId
            );
          });
          return updated;
        });
        
        // Also remove from global artifacts if it exists there
        setGlobalArtifacts(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            updated[key as keyof ArtifactsData] = updated[key as keyof ArtifactsData].filter(
              artifact => artifact.id !== artifactId
            );
          });
          return updated;
        });
        
        // Refresh global artifacts if we're currently viewing global
        if (artifactsTab === 'global') {
          loadGlobalArtifacts();
        }
        
        addToast({
          type: 'success',
          title: 'Artifact deleted',
          message: 'The artifact has been successfully deleted from all views.',
          duration: 4000
        });
      }
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session and all its data? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmationDialog(null);
        try {
          await apiClient.deleteSession(sessionId);
          setSessions(prev => prev.filter(s => s.id !== sessionId));
          
          // If the deleted session was active, clear the current session
          if (currentSession?.id === sessionId) {
            onSessionSelect(null);
            setArtifacts(mockArtifacts); // Reset to mock data
          }
          
          addToast({
            type: 'success',
            title: 'Session deleted',
            message: 'The session has been successfully deleted.'
          });
        } catch (error) {
          console.error('Failed to delete session:', error);
          addToast({
            type: 'error',
            title: 'Failed to delete session',
            message: 'Please try again.'
          });
        }
      }
    });
  };

  const loadArtifacts = async (sessionId: string) => {
    try {
      const artifactData = await apiClient.getArtifacts(sessionId);
      // Transform backend artifact format to frontend format
      setArtifacts({
        studyPlans: artifactData.study_plans?.map((plan: any, index: number) => ({
          id: plan.id || `plan_${index}`,
          title: plan.title || 'Study Plan',
          content: plan.content || '',
          type: 'study-plan',
          timestamp: plan.timestamp || new Date().toISOString(),
          editable: true
        })) || [],
        notes: artifactData.notes?.map((note: any, index: number) => ({
          id: note.id || `note_${index}`,
          title: note.title || 'Notes',
          content: note.content || '',
          type: 'notes',
          timestamp: note.timestamp || new Date().toISOString(),
          editable: true
        })) || [],
        progress: artifactData.progress?.map((prog: any, index: number) => ({
          id: prog.id || `progress_${index}`,
          title: prog.title || 'Progress Update',
          content: prog.content || '',
          type: 'progress',
          timestamp: prog.timestamp || new Date().toISOString(),
          editable: false
        })) || [],
        memory: artifactData.memory ? [{
          id: 'memory_1',
          title: 'Session Memory',
          content: typeof artifactData.memory === 'object' ? JSON.stringify(artifactData.memory, null, 2) : artifactData.memory,
          type: 'memory',
          timestamp: new Date().toISOString(),
          editable: false
        }] : []
      });
    } catch (error) {
      console.error('Failed to load artifacts:', error);
      // Keep mock data as fallback
      setArtifacts(mockArtifacts);
    }
  };

  const loadGlobalArtifacts = async () => {
    if (hasLoadedGlobal) return; // Don't reload if already loaded

    try {
      const allArtifacts: ArtifactsData = {
        studyPlans: [],
        notes: [],
        progress: [],
        memory: []
      };

      // Load artifacts from all sessions
      for (const session of sessions) {
        try {
          const sessionArtifacts = await apiClient.getArtifacts(session.id);
          
          // Add session info to each artifact
          if (sessionArtifacts.study_plans) {
            allArtifacts.studyPlans.push(...sessionArtifacts.study_plans.map((plan: any) => ({
              ...plan,
              sessionTitle: session.title,
              sessionId: session.id
            })));
          }
          if (sessionArtifacts.notes) {
            allArtifacts.notes.push(...sessionArtifacts.notes.map((note: any) => ({
              ...note,
              sessionTitle: session.title,
              sessionId: session.id
            })));
          }
          if (sessionArtifacts.progress) {
            allArtifacts.progress.push(...sessionArtifacts.progress.map((prog: any) => ({
              ...prog,
              sessionTitle: session.title,
              sessionId: session.id
            })));
          }
        } catch (error) {
          console.error(`Failed to load artifacts for session ${session.id}:`, error);
        }
      }

      setGlobalArtifacts(allArtifacts);
      setHasLoadedGlobal(true);
    } catch (error) {
      console.error('Failed to load global artifacts:', error);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSession = await apiClient.createSession({ 
        title: 'New Academic Session',
        subject: 'General Academic Study'
      });
      setSessions(prev => [newSession, ...prev]);
      onSessionSelect(newSession);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const { subject } = useSubject();

  const sessionsBySubject = useMemo(() => {
    if (!subject || subject === 'All Subjects') return sessions;
    return sessions.filter(s => (s.subject || '').toLowerCase() === subject.toLowerCase());
  }, [sessions, subject]);

  const groupedSessions = useMemo(() => groupSessions(sessionsBySubject), [sessionsBySubject]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery) return groupedSessions;
    const filtered = { ...groupedSessions };
    Object.keys(filtered).forEach(key => {
      filtered[key as keyof typeof filtered] = filtered[key as keyof typeof filtered].filter(
        session => session.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    return filtered;
  }, [groupedSessions, searchQuery]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group as keyof typeof prev] }));
  };



  const tabs = [
    { key: 'session' as const, label: 'Session', icon: BookOpen },
    { key: 'global' as const, label: 'Global', icon: FileText },
    { key: 'studyPlans' as const, label: 'Study Plans', icon: BookOpen },
    { key: 'notes' as const, label: 'Notes', icon: FileText },
    { key: 'progress' as const, label: 'Progress', icon: TrendingUp },
    { key: 'memory' as const, label: 'Memory', icon: Brain }
  ];

  if (isCollapsed) {
    return (
      <div className="w-12 bg-black/60 backdrop-blur-md border-r border-cyan-500/20 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
        <div className="mt-8 space-y-2">
          <button
            onClick={() => { setActiveTab('chat'); onToggleCollapse(); }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'chat' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setActiveTab('artifacts'); onToggleCollapse(); }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'artifacts' ? 'bg-violet-500/20 text-violet-400' : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/60 backdrop-blur-md border-r border-cyan-500/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Workspace</h2>
          <button
            onClick={onToggleCollapse}
            className="p-1 text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/40 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'artifacts'
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Artifacts
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="h-full flex flex-col">
            {/* Search and New Session */}
            <div className="p-4 border-b border-cyan-500/20">
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black/40 border border-cyan-500/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>
                <button
                  onClick={handleNewSession}
                  className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(filteredSessions).map(([group, groupSessions]) => (
                groupSessions.length > 0 && (
                  <div key={group} className="border-b border-cyan-500/10 last:border-b-0">
                    <button
                      onClick={() => toggleGroup(group)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-cyan-500/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-zinc-300 capitalize">
                        {group === 'today' ? 'Today' : group === 'thisWeek' ? 'This Week' : 'Older'}
                      </span>
                      {expandedGroups[group as keyof typeof expandedGroups] ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    {expandedGroups[group as keyof typeof expandedGroups] && (
                      <div className="px-2 pb-2 space-y-1">
                        {groupSessions.map((session) => (
                          <ChatSessionComponent
                            key={session.id}
                            {...session}
                            onClick={() => onSessionSelect(session)}
                            onDelete={() => handleDeleteSession(session.id)}
                            isActive={currentSession?.id === session.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Artifacts Tabs */}
            <div className="p-4 border-b border-violet-500/20">
              <div className="flex overflow-x-auto scrollbar-hide gap-1 pb-2">
                <div className="flex gap-1 min-w-max">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setArtifactsTab(tab.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        artifactsTab === tab.key
                          ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                          : 'text-zinc-400 hover:text-zinc-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Artifacts Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {(() => {
                  if (artifactsTab === 'global') {
                    const currentArtifacts = globalArtifacts;
                    const hasAnyArtifacts = Object.values(currentArtifacts).some(arr => arr.length > 0);
                    
                    if (!hasAnyArtifacts) {
                      return (
                        <div className="text-center text-zinc-500 py-8">
                          <p>No artifacts across all sessions</p>
                          <p className="text-sm mt-1">Create content in any session to see it here</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {currentArtifacts.studyPlans.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Study Plans
                            </h3>
                            <div className="space-y-2">
                              {currentArtifacts.studyPlans.map((artifact) => (
                                <ArtifactItem key={artifact.id} {...artifact} sessionTitle={artifact.sessionTitle} sessionId={artifact.sessionId} onDelete={handleDeleteArtifact} />
                              ))}
                            </div>
                          </div>
                        )}
                        {currentArtifacts.notes.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Notes
                            </h3>
                            <div className="space-y-2">
                              {currentArtifacts.notes.map((artifact) => (
                                <ArtifactItem key={artifact.id} {...artifact} sessionTitle={artifact.sessionTitle} sessionId={artifact.sessionId} onDelete={handleDeleteArtifact} />
                              ))}
                            </div>
                          </div>
                        )}
                        {currentArtifacts.progress.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Progress
                            </h3>
                            <div className="space-y-2">
                              {currentArtifacts.progress.map((artifact) => (
                                <ArtifactItem key={artifact.id} {...artifact} sessionTitle={artifact.sessionTitle} sessionId={artifact.sessionId} onDelete={handleDeleteArtifact} />
                              ))}
                            </div>
                          </div>
                        )}
                        {currentArtifacts.memory.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              Memory
                            </h3>
                            <div className="space-y-2">
                              {currentArtifacts.memory.map((artifact) => (
                                <ArtifactItem key={artifact.id} {...artifact} sessionTitle={artifact.sessionTitle} sessionId={artifact.sessionId} onDelete={handleDeleteArtifact} />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  } else if (artifactsTab === 'session') {
                    const currentArtifacts = artifacts;
                    const hasAnyArtifacts = Object.values(currentArtifacts).some(arr => arr.length > 0);
                    
                    if (!hasAnyArtifacts) {
                      return (
                        <div className="text-center text-zinc-500 py-8">
                          <p>No artifacts in current session</p>
                          <p className="text-sm mt-1">Select a session or create content to see artifacts</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {currentArtifacts.studyPlans.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Study Plans
                            </h3>
                            <div className="space-y-2">
                              {currentArtifacts.studyPlans.map((artifact) => (
                                <ArtifactItem key={artifact.id} {...artifact} onDelete={handleDeleteArtifact} />
                              ))}
                            </div>
                          </div>
                        )}
                        {currentArtifacts.notes.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Notes
                            </h3>
                            <div className="space-y-2">
                              {currentArtifacts.notes.map((artifact) => (
                                <ArtifactItem key={artifact.id} {...artifact} onDelete={handleDeleteArtifact} />
                              ))}
                            </div>
                          </div>
                        )}
                        {currentArtifacts.progress.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Progress
                            </h3>
                            <div className="space-y-2">
                              {currentArtifacts.progress.map((artifact) => (
                                <ArtifactItem key={artifact.id} {...artifact} onDelete={handleDeleteArtifact} />
                              ))}
                            </div>
                          </div>
                        )}
                        {currentArtifacts.memory.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              Memory
                            </h3>
                            <div className="space-y-2">
                              {currentArtifacts.memory.map((artifact) => (
                                <ArtifactItem key={artifact.id} {...artifact} onDelete={handleDeleteArtifact} />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  } else {
                    // Individual artifact type tabs (studyPlans, notes, progress, memory)
                    const artifactList = artifacts[artifactsTab as keyof ArtifactsData] || [];
                    
                    if (artifactList.length === 0) {
                      return (
                        <div className="text-center text-zinc-500 py-8">
                          <p>No {artifactsTab} available</p>
                          <p className="text-sm mt-1">Create some content to see it here</p>
                        </div>
                      );
                    }

                    return artifactList.map((artifact) => (
                      <ArtifactItem key={artifact.id} {...artifact} onDelete={handleDeleteArtifact} />
                    ));
                  }
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirmationDialog?.isOpen || false}
        title={confirmationDialog?.title || ''}
        message={confirmationDialog?.message || ''}
        onConfirm={confirmationDialog?.onConfirm || (() => {})}
        onCancel={() => setConfirmationDialog(null)}
      />
    </div>
  );
};