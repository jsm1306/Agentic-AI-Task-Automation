'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Search, FileText, Save } from 'lucide-react';

const activities = [
  { icon: Brain, label: 'Planning study schedule...', color: 'text-cyan-400' },
  { icon: Search, label: 'Searching curriculum...', color: 'text-violet-400' },
  { icon: FileText, label: 'Writing notes...', color: 'text-cyan-400' },
  { icon: Save, label: 'Saving progress...', color: 'text-violet-400' }
];

export const AgentActivity: React.FC = () => {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length);
      setIsActive(true);
      setTimeout(() => setIsActive(false), 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const ActivityIcon = activities[currentActivity].icon;

  return (
    <div className="px-4 py-2 border-t border-cyan-500/10 bg-black/20">
      <div className="flex items-center gap-2">
        <ActivityIcon className={`w-4 h-4 ${activities[currentActivity].color} ${isActive ? 'animate-pulse' : ''}`} />
        <span className="text-sm text-zinc-400">AI Activity:</span>
        <span className={`text-sm ${activities[currentActivity].color} transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
          {activities[currentActivity].label}
        </span>
      </div>
    </div>
  );
};