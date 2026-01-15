'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { useSubject } from '../context/SubjectContext';

const subjects = [
  'All Subjects',
  'Object Detection',
  'Natural Language Processing',
  'Computer Vision',
];

export const SubjectSelector: React.FC = () => {
  const { subject: selectedSubject, setSubject } = useSubject();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        data-subject-button="true"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"
      >
        {selectedSubject}
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && buttonRef.current && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-black/90 backdrop-blur-md border border-cyan-500/30 rounded-lg overflow-hidden z-[9999] shadow-lg"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            minWidth: '160px'
          }}
        >
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => {
                setSubject(subject);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-white hover:bg-cyan-500/10 transition-colors"
            >
              {subject}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};