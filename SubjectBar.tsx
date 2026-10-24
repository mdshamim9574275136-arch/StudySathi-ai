import React from 'react';
import { 
  Calculator, 
  Atom, 
  BookOpen, 
  Globe, 
  Code2, 
  GraduationCap, 
  Compass, 
  ListOrdered, 
  Lightbulb, 
  HelpCircle,
  UserRound,
  FlaskConical,
  Languages,
  Landmark,
  Laptop,
  BookMarked
} from 'lucide-react';
import { SubjectItem, ExplanationMode } from '../types';

interface SubjectBarProps {
  subjects: SubjectItem[];
  selectedSubject: string | null;
  onSelectSubject: (subjectId: string | null) => void;
  selectedMode: ExplanationMode;
  onSelectMode: (mode: ExplanationMode) => void;
  onSelectTeacher: (subjectId: string) => void;
  selectedTeacherId: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-3.5 h-3.5" />,
  Atom: <Atom className="w-3.5 h-3.5" />,
  BookOpen: <BookOpen className="w-3.5 h-3.5" />,
  Globe: <Globe className="w-3.5 h-3.5" />,
  Code2: <Code2 className="w-3.5 h-3.5" />,
  GraduationCap: <GraduationCap className="w-3.5 h-3.5" />,
};

export const SubjectBar: React.FC<SubjectBarProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  selectedMode,
  onSelectMode,
  onSelectTeacher,
  selectedTeacherId,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xs border-b border-indigo-50/80 px-4 py-2 sticky top-[57px] z-20">
      <div className="max-w-5xl mx-auto space-y-2">
        {/* Dedicated AI teachers: one specialist teacher per subject */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
            <UserRound className="w-4 h-4" />
            <span>AI Teachers (हर विषय के अलग टीचर)</span>
          </div>
          <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar py-0.5">
            {subjects.map((sub, index) => {
              const teacherIcons = [Calculator, FlaskConical, Languages, Landmark, Laptop, BookMarked];
              const TeacherIcon = teacherIcons[index % teacherIcons.length];
              const teacherNames: Record<string, string> = {
                maths: 'Maths Sir', science: 'Science Sir', english: 'English Ma’am',
                social: 'Social Studies Sir', coding: 'Coding Sir', exam_prep: 'Exam Coach'
              };
              const isActive = selectedTeacherId === sub.id;
              return (
                <button key={`teacher-${sub.id}`} type="button"
                  onClick={() => onSelectTeacher(sub.id)}
                  className={`shrink-0 min-w-[118px] flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${isActive ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-200' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50'}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                    <TeacherIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap text-[11px] font-bold text-slate-800">{teacherNames[sub.id] || `${sub.name} Teacher`}</span>
                    <span className="block whitespace-nowrap text-[10px] text-slate-500">{sub.nameHindi}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Horizontal scrollable subjects bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 text-xs">
          <button
            type="button"
            onClick={() => onSelectSubject(null)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
              selectedSubject === null
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>All Subjects (सभी विषय)</span>
          </button>

          {subjects.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubject(isSelected ? null : sub.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {iconMap[sub.icon] || <GraduationCap className="w-3.5 h-3.5" />}
                <span>{sub.name}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">({sub.nameHindi})</span>
              </button>
            );
          })}
        </div>

        {/* Learning mode selector */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <span className="hidden sm:inline">Tutor Mode:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectMode('normal')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  selectedMode === 'normal'
                    ? 'bg-indigo-100 text-indigo-800 font-semibold'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => onSelectMode('stepbystep')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                  selectedMode === 'stepbystep'
                    ? 'bg-indigo-100 text-indigo-800 font-semibold'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ListOrdered className="w-3 h-3 text-indigo-600" />
                Step-by-Step
              </button>
              <button
                type="button"
                onClick={() => onSelectMode('simplify')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                  selectedMode === 'simplify'
                    ? 'bg-purple-100 text-purple-800 font-semibold'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Lightbulb className="w-3 h-3 text-purple-600" />
                Simple Analogy
              </button>
              <button
                type="button"
                onClick={() => onSelectMode('quiz')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                  selectedMode === 'quiz'
                    ? 'bg-emerald-100 text-emerald-800 font-semibold'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-3 h-3 text-emerald-600" />
                Quiz Mode
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-medium hidden md:block">
            Auto-detects Hindi / English / Hinglish
          </div>
        </div>
      </div>
    </div>
  );
};
