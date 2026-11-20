import React from 'react';
import { Calculator, Atom, BookOpen, Globe, Code2, GraduationCap, Compass, ListOrdered, Lightbulb, HelpCircle } from 'lucide-react';
import { SubjectItem, ExplanationMode } from './types';

interface SubjectBarProps {
  subjects: SubjectItem[];
  selectedSubject: string | null;
  onSelectSubject: (subjectId: string | null) => void;
  selectedMode: ExplanationMode;
  onSelectMode: (mode: ExplanationMode) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-4 h-4" />,
  Atom: <Atom className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
  Code2: <Code2 className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
};

export const SubjectBar: React.FC<SubjectBarProps> = ({ subjects, selectedSubject, onSelectSubject, selectedMode, onSelectMode }) => (
  <section className="ss-subject-panel mx-auto w-full max-w-6xl px-3 sm:px-5 py-3">
    <div className="flex items-center justify-between gap-2 mb-2">
      <div><p className="ss-section-kicker">PERSONAL AI LEARNING</p><h2 className="ss-section-title">Choose a subject</h2></div>
      <span className="ss-ai-status"><span /> AI READY</span>
    </div>
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <button type="button" onClick={() => onSelectSubject(null)} className={`ss-subject-chip ${selectedSubject === null ? 'active' : ''}`}><Compass className="w-4 h-4"/><span>All Subjects</span></button>
      {subjects.map((sub) => <button key={sub.id} type="button" onClick={() => onSelectSubject(selectedSubject === sub.id ? null : sub.id)} className={`ss-subject-chip ${selectedSubject === sub.id ? 'active' : ''}`}>{iconMap[sub.icon] || <GraduationCap className="w-4 h-4"/>}<span>{sub.name}</span></button>)}
    </div>
    <div className="ss-mode-row"><span className="ss-mode-label">Learning style</span>
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button type="button" onClick={() => onSelectMode('normal')} className={`ss-mode-chip ${selectedMode === 'normal' ? 'active' : ''}`}>Standard</button>
        <button type="button" onClick={() => onSelectMode('stepbystep')} className={`ss-mode-chip ${selectedMode === 'stepbystep' ? 'active' : ''}`}><ListOrdered className="w-3.5 h-3.5"/> Step by step</button>
        <button type="button" onClick={() => onSelectMode('simplify')} className={`ss-mode-chip ${selectedMode === 'simplify' ? 'active' : ''}`}><Lightbulb className="w-3.5 h-3.5"/> Simple</button>
        <button type="button" onClick={() => onSelectMode('quiz')} className={`ss-mode-chip ${selectedMode === 'quiz' ? 'active' : ''}`}><HelpCircle className="w-3.5 h-3.5"/> Quiz</button>
      </div>
    </div>
  </section>
);
