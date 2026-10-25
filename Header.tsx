import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Award, 
  ShieldCheck, 
  Globe, 
  Baby, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from './types.ts';

interface HeaderProps {
  onNewChat: () => void;
  onOpenQuiz: () => void;
  onOpenPrivacy: () => void;
  messageCount: number;
  serverReady: boolean;
  selectedLanguage: string;
  onSelectLanguage: (langCode: string) => void;
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewChat,
  onOpenQuiz,
  onOpenPrivacy,
  messageCount,
  serverReady,
  selectedLanguage,
  onSelectLanguage,
  simpleMode,
  onToggleSimpleMode,
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Brand identity: Premium SS + AI Monogram & Shaikh Sahewaz Credit */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Stylized SS + AI Monogram Badge */}
          <div className="relative shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-950 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30">
            <div className="flex items-baseline font-black tracking-tighter text-sm sm:text-base select-none">
              <span className="text-white drop-shadow-xs">S</span>
              <span className="text-indigo-200 -ml-0.5 drop-shadow-xs">S</span>
            </div>
            
            {/* Small Glowing AI pill */}
            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[9px] font-extrabold text-white shadow-xs border border-white/80 flex items-center gap-0.5">
              AI
            </span>

            {/* Live Server Indicator Ping */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${serverReady ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${serverReady ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-950 bg-clip-text text-transparent truncate">
                StudySaathi AI
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 hidden xs:inline-flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Free Tutor
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate flex items-center gap-1">
              <span>Created by <strong className="text-indigo-700 font-semibold">Shaikh Sahewaz</strong></span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-500">स्टडी साथी</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Language Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Simple Language Mode Toggle for Class 1-8 */}
          <button
            onClick={onToggleSimpleMode}
            type="button"
            className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all active:scale-95 ${
              simpleMode
                ? 'bg-amber-100/90 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Toggle simple, easy language for younger students (Class 1-8)"
          >
            <Baby className={`w-3.5 h-3.5 ${simpleMode ? 'text-amber-700' : 'text-slate-400'}`} />
            <span>{simpleMode ? 'Simple Mode ON' : 'Simple Mode'}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              type="button"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/90 transition-all active:scale-95 shadow-2xs"
              title="Select your preferred response language"
              aria-label="Language selector"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="max-w-[70px] sm:max-w-[100px] truncate">{currentLangObj.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Language Selection Popover */}
            {isLangMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsLangMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-indigo-100 p-2 z-50 animate-fade-in max-h-80 overflow-y-auto">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Choose Language (भाषा)</span>
                    <span className="text-[10px] text-indigo-600 lowercase">14 languages</span>
                  </div>

                  <div className="pt-1 space-y-0.5">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = selectedLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            onSelectLanguage(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-800 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <div>
                              <span className="font-medium">{lang.nativeName}</span>
                              {lang.code !== 'auto' && (
                                <span className="text-[10px] text-slate-400 ml-1.5">({lang.name})</span>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Simple Mode Toggle inside menu */}
                  <div className="mt-2 pt-2 border-t border-slate-100 md:hidden">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleSimpleMode();
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        simpleMode ? 'bg-amber-100 text-amber-900' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Baby className="w-4 h-4 text-amber-600" />
                        Simple Language (Class 1-8)
                      </span>
                      <span>{simpleMode ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Quiz button */}
          <button
            onClick={onOpenQuiz}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 hover:from-purple-100 hover:to-indigo-100 border border-indigo-200/80 transition-all duration-150 active:scale-95 shadow-2xs"
            title="Generate interactive practice quiz"
          >
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Quiz</span>
          </button>

          {/* New Chat button */}
          <button
            onClick={onNewChat}
            disabled={messageCount === 0}
            type="button"
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            title="Start fresh conversation"
            aria-label="New chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">New</span>
          </button>

          {/* Safety & Info modal trigger */}
          <button
            onClick={onOpenPrivacy}
            type="button"
            className="p-1.5 sm:px-2 sm:py-1.5 text-xs font-medium rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 border border-transparent hover:border-slate-200"
            title="Privacy, safety and creator details"
            aria-label="Safety and privacy notice"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
