import React from 'react';
import {
  Calculator, Atom, BookOpen, Globe, Code2, GraduationCap,
  Compass, ListOrdered, Lightbulb, HelpCircle, Sparkles, MessageCircle
} from 'lucide-react';
import type { SubjectItem, ExplanationMode } from './types';

interface SubjectBarProps {
  subjects: SubjectItem[];
  selectedSubject: string | null;
  onSelectSubject: (subjectId: string | null) => void;
  selectedMode: ExplanationMode;
  onSelectMode: (mode: ExplanationMode) => void;
  onSelectTeacher: (subjectId: string | null) => void;
  selectedTeacherId: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-4 h-4" />,
  Atom: <Atom className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
  Code2: <Code2 className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
};

const teacherDetails: Record<string, { name: string; role: string; avatar: string; accent: string; greeting: string }> = {
  maths: { name: 'Arjun Sir', role: 'Mathematics', avatar: 'maths', accent: 'from-sky-400 to-blue-600', greeting: 'Numbers made simple' },
  science: { name: 'Meera Ma’am', role: 'Science', avatar: 'science', accent: 'from-emerald-400 to-teal-600', greeting: 'Explore how things work' },
  english: { name: 'Anaya Ma’am', role: 'English & Grammar', avatar: 'english', accent: 'from-fuchsia-400 to-purple-600', greeting: 'Speak and write confidently' },
  social: { name: 'Kabir Sir', role: 'Social Science', avatar: 'social', accent: 'from-amber-400 to-orange-600', greeting: 'Discover the world' },
  coding: { name: 'Dev Sir', role: 'Computer & Coding', avatar: 'coding', accent: 'from-violet-400 to-indigo-600', greeting: 'Build your coding skills' },
  exam_prep: { name: 'Tara Ma’am', role: 'Exam Coach', avatar: 'exam_prep', accent: 'from-rose-400 to-pink-600', greeting: 'Prepare with confidence' },
};

export const SubjectBar: React.FC<SubjectBarProps> = ({
  subjects, selectedSubject, onSelectSubject, selectedMode, onSelectMode,
  onSelectTeacher, selectedTeacherId,
}) => {
  return (
    <section className="ss-teacher-section">
      <div className="ss-section-heading">
        <div>
          <div className="ss-section-kicker"><Sparkles className="w-3.5 h-3.5" /> YOUR PERSONAL LEARNING TEAM</div>
          <h2>Meet your AI teachers</h2>
          <p>Choose a teacher to open your own private subject chat.</p>
        </div>
        <div className="ss-heading-actions">
          <span className="ss-teacher-count">{subjects.length} SPECIALISTS</span>
          <button type="button" className="ss-general-chat" onClick={() => onSelectTeacher(null)}>General AI chat</button>
        </div>
      </div>

      <div className="ss-teacher-grid">
        {subjects.map((sub) => {
          const detail = teacherDetails[sub.id] || {
            name: `${sub.name} Teacher`, role: sub.name, avatar: 'exam_prep',
            accent: 'from-indigo-400 to-violet-600', greeting: 'Let’s learn together',
          };
          const isActive = selectedTeacherId === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelectTeacher(sub.id)}
              aria-pressed={isActive}
              className={`ss-teacher-card ${isActive ? 'is-active' : ''}`}
            >
              <span className={`ss-teacher-art bg-gradient-to-br ${detail.accent}`}>
                <img src={`/teacher-avatars/${detail.avatar}.svg`} alt={`${detail.name}, cartoon AI teacher`} />
                <span className="ss-teacher-online"><i /> AI READY</span>
              </span>
              <span className="ss-teacher-info">
                <strong>{detail.name}</strong>
                <small>{detail.role}</small>
                <em>{detail.greeting}</em>
                <span className="ss-open-chat">{isActive ? 'Chat selected' : 'Open private chat'} <MessageCircle className="w-3.5 h-3.5" /></span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="ss-subject-mode-row">
        <div className="ss-subject-pills">
          <button type="button" onClick={() => onSelectSubject(null)} className={selectedSubject === null ? 'is-selected' : ''}>
            <Compass className="w-3.5 h-3.5" /> All subjects
          </button>
          {subjects.map((sub) => (
            <button key={sub.id} type="button" onClick={() => onSelectSubject(selectedSubject === sub.id ? null : sub.id)} className={selectedSubject === sub.id ? 'is-selected' : ''}>
              {iconMap[sub.icon] || <GraduationCap className="w-3.5 h-3.5" />} {sub.name}
            </button>
          ))}
        </div>
        <div className="ss-tutor-modes">
          <span>Tutor style</span>
          <button type="button" onClick={() => onSelectMode('normal')} className={selectedMode === 'normal' ? 'is-selected' : ''}>Standard</button>
          <button type="button" onClick={() => onSelectMode('stepbystep')} className={selectedMode === 'stepbystep' ? 'is-selected' : ''}><ListOrdered className="w-3 h-3" /> Step-by-step</button>
          <button type="button" onClick={() => onSelectMode('simplify')} className={selectedMode === 'simplify' ? 'is-selected' : ''}><Lightbulb className="w-3 h-3" /> Simple</button>
          <button type="button" onClick={() => onSelectMode('quiz')} className={selectedMode === 'quiz' ? 'is-selected' : ''}><HelpCircle className="w-3 h-3" /> Quiz</button>
        </div>
      </div>
    </section>
  );
};
