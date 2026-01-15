"use client";

import React, { useState, useRef } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { MainPlayground } from '../components/layout/MainPlayground';
import { UnifiedSidebar } from '../components/layout/UnifiedSidebar';
import { ChatSession } from '../lib/api';

export default function Home() {
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [artifactsRefreshTrigger, setArtifactsRefreshTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current || !isDragging) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = Math.max(50, e.clientX - containerRect.left); // Allow very small width when collapsed
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    if (!isSidebarCollapsed) {
      setSidebarWidth(48); // Collapsed width
    } else {
      setSidebarWidth(320); // Default expanded width
    }
  };

  const handleArtifactsChanged = () => {
    setArtifactsRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative" ref={containerRef}>
      {/* Faint grid texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      <TopBar />
      <div className="flex h-[calc(100vh-80px)] relative min-h-0">
        <div style={{ width: `${sidebarWidth}px` }}>
          <UnifiedSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
            currentSession={currentSession}
            onSessionSelect={setCurrentSession}
            artifactsRefreshTrigger={artifactsRefreshTrigger}
          />
        </div>
        {/* Resizable divider */}
        <div
          className={`relative w-1 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent shadow-[0_0_10px_rgba(0,255,255,0.3)] cursor-col-resize hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all duration-200 group ${
            isDragging ? 'shadow-[0_0_20px_rgba(0,255,255,0.8)]' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </div>
        <div className="flex-1 min-w-0">
          <MainPlayground session={currentSession} onArtifactsChanged={handleArtifactsChanged} />
        </div>
      </div>
    </div>
  );
}
