'use client';

import React, { createContext, useContext, useState } from 'react';

export type Subject = string;

interface SubjectContextType {
  subject: Subject;
  setSubject: (s: Subject) => void;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subject, setSubject] = useState<Subject>('All Subjects');
  return (
    <SubjectContext.Provider value={{ subject, setSubject }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubject = () => {
  const ctx = useContext(SubjectContext);
  if (!ctx) throw new Error('useSubject must be used inside SubjectProvider');
  return ctx;
};