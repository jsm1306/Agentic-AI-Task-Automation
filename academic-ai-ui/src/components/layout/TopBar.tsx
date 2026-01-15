import React from 'react';
import { SubjectSelector } from '../ui/SubjectSelector';
import { AIStatus } from '../ui/AIStatus';
import { SettingsDrawer } from '../ui/SettingsDrawer';

export const TopBar: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-cyan-500/20">
      <h1 className="text-xl font-bold text-white">Autonomous Academic AI Assistant</h1>
      <div className="flex items-center gap-4">
        <SubjectSelector />
        <AIStatus />
        <SettingsDrawer />
      </div>
    </div>
  );
};