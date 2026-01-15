'use client';

import React, { useState } from 'react';
import { BookOpen, FileText, TrendingUp, Brain, Download, Copy, Edit3 } from 'lucide-react';
import { ArtifactItem } from '../ui/ArtifactItem';

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

export const ArtifactsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studyPlans' | 'notes' | 'progress' | 'memory'>('studyPlans');

  const tabs = [
    { key: 'studyPlans', label: 'Study Plans', icon: BookOpen },
    { key: 'notes', label: 'Notes', icon: FileText },
    { key: 'progress', label: 'Progress', icon: TrendingUp },
    { key: 'memory', label: 'Memory', icon: Brain }
  ];

  return (
    <div className="h-full bg-black/80 backdrop-blur-md border-l border-cyan-500/20 flex flex-col">
      <div className="p-4 border-b border-cyan-500/20">
        <h2 className="text-lg font-semibold text-white mb-4">Generated Artifacts</h2>
        <div className="flex gap-1 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-black/40 border border-transparent text-zinc-400 hover:bg-cyan-500/10 hover:border-cyan-500/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mockArtifacts[activeTab].map((artifact) => (
          <ArtifactItem key={artifact.id} {...artifact} />
        ))}
      </div>
    </div>
  );
};