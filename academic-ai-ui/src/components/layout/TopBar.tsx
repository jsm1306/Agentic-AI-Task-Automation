import React from 'react';
import { SubjectSelector } from '../ui/SubjectSelector';
import { AIStatus } from '../ui/AIStatus';
import { SettingsDrawer } from '../ui/SettingsDrawer';
import { useSubject } from '../context/SubjectContext';
import { useToast } from '../ui/Toast';
import { apiClient } from '../../lib/api';

export const TopBar: React.FC = () => {
  const { subject } = useSubject();
  const { addToast } = useToast();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowed.includes(ext)) {
      addToast({ title: 'Invalid file type', message: 'Only PDF and DOC/DOCX files are accepted. Please upload a PDF or DOC/DOCX file.', type: 'error' });
      e.currentTarget.value = '';
      return;
    }

    if (!subject || subject === 'All Subjects') {
      addToast({ title: 'No subject selected', message: 'Please select a subject before uploading files.', type: 'error' });
      e.currentTarget.value = '';
      return;
    }

    try {
      const res = await apiClient.uploadSubjectFile(subject, file);
      addToast({ title: 'Upload successful', message: `${res.files.length} file(s) uploaded for ${subject}`, type: 'success' });
      e.currentTarget.value = '';
    } catch (err: any) {
      addToast({ title: 'Upload failed', message: err.message || 'Upload failed', type: 'error' });
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-cyan-500/20">
      <h1 className="text-xl font-bold text-white">Autonomous Academic AI Assistant</h1>
      <div className="flex items-center gap-2">
        <SubjectSelector />

        {/* Upload control placed next to subject selector in header */}
        <label className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors cursor-pointer">
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onFileChange} />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v12m0 0l-4-4m4 4 4-4M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
        </label>

        <AIStatus />
        <SettingsDrawer />
      </div>
    </div>
  );
};