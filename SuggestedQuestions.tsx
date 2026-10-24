import React from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  BookCheck, 
  Languages, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Camera,
  Share2
} from 'lucide-react';
import { SubjectItem } from '../types';

interface SuggestedQuestionsProps {
  subjects: SubjectItem[];
  selectedSubject: string | null;
  onSelectPrompt: (promptText: string) => void;
  onTriggerPhotoUpload?: () => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  subjects,
  selectedSubject,
  onSelectPrompt,
  onTriggerPhotoUpload,
}) => {
  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject);

  const activePrompts = currentSubjectObj
    ? currentSubjectObj.prompts
    : [
        'Explain Pythagoras theorem with a real-life example and proof',
        'प्रकाश संश्लेषण (Photosynthesis) क्या है? इसके मुख्य चरण समझाइए',
        'Solve quadratic equation: 2x² - 7x + 3 = 0 step-by-step',
        'Explain Present, Past and Future tenses with simple sentence tables',
        'Explain Newton’s Three Laws of Motion with cricket examples',
        'Write a Python program to check if a number is prime, with comments',
        'What were the main causes of the Indian Revolt of 1857?',
        'How to create an effective 30-day board exam revision timetable?',
      ];

  return (
    <div className="py-5 px-3 sm:px-4 max-w-3xl mx-auto space-y-5">
      {/* Hero Welcome Card with Shaikh Sahewaz Branding */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 text-white p-5 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>StudySaathi AI</span>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-400/20">
              <span>Created by Shaikh Sahewaz</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            नमस्ते! Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-indigo-100 to-purple-200">StudySaathi AI</span>
          </h2>

          <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl leading-relaxed">
            Your personal, 24/7 educational AI tutor. Ask questions in <strong>Hindi, English, Gujarati, Marathi, Bengali, Tamil, Telugu</strong> or upload photos of your homework problems!
          </p>

          {/* Quick Capability Badges */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-indigo-200 font-medium">
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <Camera className="w-3.5 h-3.5 text-emerald-300" />
              Homework Photo Solver
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <Languages className="w-3.5 h-3.5 text-indigo-300" />
              14+ Indian & Global Languages
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <Share2 className="w-3.5 h-3.5 text-green-300" />
              WhatsApp Note Sharing
            </span>
          </div>
        </div>
      </div>

      {/* Homework Photo Banner */}
      {onTriggerPhotoUpload && (
        <div 
          onClick={onTriggerPhotoUpload}
          className="cursor-pointer group p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-200/90 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                📸 Have a photo of a textbook question or diagram?
              </p>
              <p className="text-[11px] text-slate-500">
                Click here or tap the camera icon below to snap or upload a homework problem
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      {/* Suggested Questions Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            {currentSubjectObj ? `${currentSubjectObj.name} Questions` : 'Suggested Student Questions'}
          </span>
          <span className="text-slate-400 font-normal lowercase">Click to ask</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          {activePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="group text-left p-3.5 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-indigo-50/70 hover:to-purple-50/70 border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-200 flex items-start justify-between gap-3 active:scale-[0.98]"
            >
              <span className="text-xs sm:text-sm text-slate-700 font-medium group-hover:text-indigo-900 leading-snug">
                {prompt}
              </span>
              <ArrowRight className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all mt-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Honest Exam Policy Callout */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-indigo-950">
            StudySaathi Academic Integrity Guarantee • Created by Shaikh Sahewaz
          </p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            We build real conceptual mastery and analytical thinking. StudySaathi never makes fake claims of guaranteed paper leaks or 100% exam prediction. Your own regular practice and understanding will bring true exam success!
          </p>
        </div>
      </div>
    </div>
  );
};
