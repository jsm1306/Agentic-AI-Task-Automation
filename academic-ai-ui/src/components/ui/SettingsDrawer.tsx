'use client';

import React, { useState } from 'react';
import { Settings, Moon, Sun, RotateCcw, Trash2, BarChart3, Download } from 'lucide-react';

export const SettingsDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    // In a real app, this would update the theme
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-black/50 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                >
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Reset Session</span>
                <button className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Clear Memory</span>
                <button className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">API Usage</span>
                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-500/10 border border-zinc-500/30 rounded-lg text-zinc-400">
                  <BarChart3 className="w-4 h-4" />
                  1,234 / 10,000
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Export Data</span>
                <button className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};