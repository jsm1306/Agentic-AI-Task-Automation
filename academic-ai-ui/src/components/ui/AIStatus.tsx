'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Search, FileText, Save } from 'lucide-react';

const statuses = [
  { icon: Brain, label: 'Planning', color: 'text-cyan-400' },
  { icon: Search, label: 'Searching', color: 'text-violet-400' },
  { icon: FileText, label: 'Writing Notes', color: 'text-cyan-400' },
  { icon: Save, label: 'Saving Progress', color: 'text-violet-400' }
];

export const AIStatus: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatus((prev) => (prev + 1) % statuses.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const StatusIcon = statuses[currentStatus].icon;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-md border border-cyan-500/20 rounded-lg">
      <StatusIcon className={`w-4 h-4 ${statuses[currentStatus].color} animate-pulse`} />
      <span className={`text-white text-sm animate-pulse ${statuses[currentStatus].color === 'text-cyan-400' ? 'animate-[pulse_2s_ease-in-out_infinite]' : 'animate-[pulse_2s_ease-in-out_infinite_0.5s]'}`}>
        {statuses[currentStatus].label}
      </span>
    </div>
  );
};