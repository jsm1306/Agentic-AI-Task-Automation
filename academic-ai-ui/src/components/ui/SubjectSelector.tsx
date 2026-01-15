'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const subjects = [
  'Object Detection',
  'Natural Language Processing',
  'Computer Vision',
  'Machine Learning',
  'Deep Learning',
  'Data Science'
];

export const SubjectSelector: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('Object Detection');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"
      >
        {selectedSubject}
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-black/90 backdrop-blur-md border border-cyan-500/30 rounded-lg overflow-hidden">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => {
                setSelectedSubject(subject);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-white hover:bg-cyan-500/10 transition-colors"
            >
              {subject}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};