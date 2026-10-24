/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Loader2, 
  AlertCircle, 
  Mic, 
  MicOff, 
  Sparkles, 
  RotateCcw, 
  Camera, 
  Image as ImageIcon, 
  X, 
  Check, 
  Upload,
  HelpCircle,
  ListOrdered,
  Lightbulb,
  Baby
} from 'lucide-react';
import { Header } from './components/Header';
import { SubjectBar } from './components/SubjectBar';
import { MessageBubble } from './components/MessageBubble';
import { SuggestedQuestions } from './components/SuggestedQuestions';
import { QuizModal } from './components/QuizModal';
import { PrivacyModal } from './components/PrivacyModal';
import { Message, MessageImage, SubjectItem, ExplanationMode } from './types';

// Default fallback subjects
const DEFAULT_SUBJECTS: SubjectItem[] = [
  {
    id: 'maths',
    name: 'Mathematics',
    nameHindi: 'गणित',
    icon: 'Calculator',
    color: 'from-blue-600 to-indigo-600',
    prompts: [
      'Explain Pythagoras theorem with a real-life example and proof',
      'Solve quadratic equation: 2x² - 7x + 3 = 0 step-by-step',
      'How does compound interest work? Explain with formula and example',
      'त्रिकोणमिति (Trigonometry) की sin, cos, tan तालिका याद रखने की आसान ट्रिक',
    ],
  },
  {
    id: 'science',
    name: 'Science (Phy/Chem/Bio)',
    nameHindi: 'विज्ञान',
    icon: 'Atom',
    color: 'from-emerald-600 to-teal-600',
    prompts: [
      'प्रकाश संश्लेषण (Photosynthesis) क्या है? इसके मुख्य चरण समझाइए',
      'Explain Newton’s Three Laws of Motion with cricket examples',
      'How to balance chemical equations? Teach me with 2 examples',
      'What is DNA and how does it store genetic information?',
    ],
  },
  {
    id: 'english',
    name: 'English & Grammar',
    nameHindi: 'अंग्रेजी',
    icon: 'BookOpen',
    color: 'from-purple-600 to-pink-600',
    prompts: [
      'Explain Present, Past and Future tenses with simple sentence tables',
      'How to write a formal letter to the school principal for leave',
      'Difference between Active and Passive Voice with 5 practice sentences',
      'Important rules for Direct and Indirect Speech with examples',
    ],
  },
  {
    id: 'social',
    name: 'Social Science',
    nameHindi: 'सामाजिक विज्ञान',
    icon: 'Globe',
    color: 'from-amber-600 to-orange-600',
    prompts: [
      'What were the main causes of the Indian Revolt of 1857?',
      'भारतीय संविधान की प्रस्तावना (Preamble) और मौलिक अधिकार समझाइए',
      'Explain the water cycle and monsoon mechanism in India',
      'Difference between Democracy and Monarchy with historical context',
    ],
  },
  {
    id: 'coding',
    name: 'Computer Science & Coding',
    nameHindi: 'कंप्यूटर और कोडिंग',
    icon: 'Code2',
    color: 'from-violet-600 to-purple-600',
    prompts: [
      'Write a Python program to check if a number is prime, with comments',
      'Explain Loops (for and while) in programming with dry-run examples',
      'What are Variables, Data Types and Functions in JavaScript?',
      'Binary search vs Linear search: Time complexity comparison',
    ],
  },
  {
    id: 'exam_prep',
    name: 'Exam Prep & Revision',
    nameHindi: 'परीक्षा रणनीति और रिवीज़न',
    icon: 'GraduationCap',
    color: 'from-rose-600 to-red-600',
    prompts: [
      'How to create an effective 30-day board exam revision timetable?',
      'Active recall और Pomodoro technique से पढ़ाई कैसे करें?',
      'How to write neat, high-scoring answers in Science & Social exams?',
      'Give me a 5-question quick diagnostic test for Class 10 Light chapter',
    ],
  },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem('studysaathi_chat_session');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverReady, setServerReady] = useState(true);

  // Subject and Mode state
  const [subjects, setSubjects] = useState<SubjectItem[]>(DEFAULT_SUBJECTS);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ExplanationMode>('normal');

  // Homework Photo State
  const [attachedImage, setAttachedImage] = useState<MessageImage | null>(null);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);

  // Language & Simple Mode preferences (stored safely in localStorage)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem('studysaathi_preferred_lang') || 'auto';
    } catch {
      return 'auto';
    }
  });

  const [simpleMode, setSimpleMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('studysaathi_simple_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Modals state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // DOM Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Save session messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('studysaathi_chat_session', JSON.stringify(messages));
    } catch {
      // Ignore sessionStorage errors
    }
  }, [messages]);

  // Save language preference
  const handleSelectLanguage = (langCode: string) => {
    setSelectedLanguage(langCode);
    try {
      localStorage.setItem('studysaathi_preferred_lang', langCode);
    } catch {}
  };

  // Toggle simple mode preference
  const handleToggleSimpleMode = () => {
    const nextState = !simpleMode;
    setSimpleMode(nextState);
    try {
      localStorage.setItem('studysaathi_simple_mode', String(nextState));
    } catch {}
  };

  // Initial server health and subjects fetch
  useEffect(() => {
    const fetchHealthAndSubjects = async () => {
      try {
        const [healthRes, subjectsRes] = await Promise.allSettled([
          fetch('/api/health'),
          fetch('/api/subjects'),
        ]);

        if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
          const healthData = await healthRes.value.json();
          setServerReady(Boolean(healthData.hasApiKey));
        }

        if (subjectsRes.status === 'fulfilled' && subjectsRes.value.ok) {
          const subjectsData = await subjectsRes.value.json();
          if (Array.isArray(subjectsData.subjects) && subjectsData.subjects.length > 0) {
            setSubjects(subjectsData.subjects);
          }
        }
      } catch {
        // Fallback already present
      }
    };

    fetchHealthAndSubjects();
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Homework Photo File Handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected if needed
    e.target.value = '';
    setIsPhotoMenuOpen(false);
    setError(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB limit. Please crop or choose a smaller photo.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setAttachedImage({
        data: resultStr,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Speech to Text support
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your question directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Match voice language to student preference
      if (selectedLanguage === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (selectedLanguage === 'gu') {
        recognition.lang = 'gu-IN';
      } else if (selectedLanguage === 'bn') {
        recognition.lang = 'bn-IN';
      } else if (selectedLanguage === 'mr') {
        recognition.lang = 'mr-IN';
      } else if (selectedLanguage === 'ta') {
        recognition.lang = 'ta-IN';
      } else if (selectedLanguage === 'te') {
        recognition.lang = 'te-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = (customMessage !== undefined ? customMessage : input).trim();
    const imageToSend = attachedImage;

    // Must have either text or image
    if (!textToSend && !imageToSend) return;
    if (isLoading) return;

    setError(null);
    setInput('');
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const displayText = textToSend || '📸 Solved from uploaded homework photo';

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: displayText,
      timestamp: new Date().toISOString(),
      subject: selectedSubject || undefined,
      mode: selectedMode,
      image: imageToSend || undefined,
      language: selectedLanguage,
      simpleMode,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build safe conversation history (last 8 messages)
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          image: imageToSend || undefined,
          history: historyPayload,
          subject: selectedSubject,
          mode: selectedMode,
          language: selectedLanguage,
          simpleMode,
          teacherRole: selectedTeacherId ? ({ maths: 'patient mathematics teacher who explains calculations step by step', science: 'friendly science teacher who explains physics, chemistry and biology with practical examples', english: 'supportive English and grammar teacher who gives clear examples and corrects gently', social: 'engaging social science teacher who explains history, geography and civics in simple terms', coding: 'experienced computer science and coding teacher who explains code step by step', exam_prep: 'encouraging exam preparation coach who focuses on revision and exam-ready answers' } as Record<string, string>)[selectedTeacherId] : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer from StudySaathi');
      }

      const modelMessage: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: data.timestamp || new Date().toISOString(),
        subject: selectedSubject || undefined,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please check your connection or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartNewChat = () => {
    if (messages.length === 0) return;
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    setMessages([]);
    setError(null);
    setInput('');
    setAttachedImage(null);
    setShowClearConfirm(false);
    try {
      sessionStorage.removeItem('studysaathi_chat_session');
    } catch {}
  };

  const handleOpenQuizWithTopic = (topic: string) => {
    setQuizTopic(topic);
    setIsQuizOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hidden File Inputs for Device Camera and Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelect}
        className="hidden"
        aria-hidden="true"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
        onChange={handlePhotoSelect}
        className="hidden"
        aria-hidden="true"
      />

      {/* Sticky Top Header with SS + AI Logo, Shaikh Sahewaz Branding & Language Picker */}
      <Header
        onNewChat={handleStartNewChat}
        onOpenQuiz={() => {
          setQuizTopic('');
          setIsQuizOpen(true);
        }}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        messageCount={messages.length}
        serverReady={serverReady}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleSelectLanguage}
        simpleMode={simpleMode}
        onToggleSimpleMode={handleToggleSimpleMode}
      />

      {/* Subject & Tutor Mode Bar */}
      <SubjectBar
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        selectedTeacherId={selectedTeacherId}
        onSelectTeacher={(subjectId) => {
          setSelectedTeacherId(subjectId);
          setSelectedSubject(subjectId);
        }}
      />

      {/* Main Chat Scrollable Container */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 max-w-4xl w-full mx-auto space-y-4">
        {messages.length === 0 ? (
          <SuggestedQuestions
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSelectPrompt={(prompt) => {
              handleSendMessage(prompt);
            }}
            onTriggerPhotoUpload={() => cameraInputRef.current?.click()}
          />
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onGenerateQuizFromTopic={handleOpenQuizWithTopic}
              />
            ))}

            {/* Loading / Thinking Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5 sm:gap-3 my-3">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-700 via-purple-700 to-indigo-900 flex items-center justify-center text-white shadow-xs border border-indigo-300/40">
                  <span className="font-black text-[11px] tracking-tight">SS</span>
                </div>
                <div className="bg-white border border-indigo-100 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs max-w-[85%] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                    <span>StudySaathi AI is formulating step-by-step solution...</span>
                  </div>
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce"></span>
                  </div>
                  <p className="text-[10px] text-slate-400">Transcribing formulas, analyzing steps, and formatting answer</p>
                </div>
              </div>
            )}

            {/* Error Message Alert with Easy Retry */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 my-2 shadow-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <p className="font-semibold">{error}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-[11px] transition-colors"
                    >
                      Dismiss
                    </button>
                    {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                      <button
                        type="button"
                        onClick={() => handleSendMessage(messages[messages.length - 1].text)}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] shadow-2xs transition-colors"
                      >
                        Retry Question
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Floating Bottom Input Area (Pinned) */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-indigo-100/90 px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Homework Photo Attachment Preview Card */}
          {attachedImage && (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-50/90 border border-indigo-200 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={attachedImage.data}
                  alt="Homework attachment thumbnail"
                  className="w-12 h-12 rounded-xl object-cover border border-indigo-300 shadow-2xs"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-indigo-950 truncate">
                    {attachedImage.name || 'Homework Photo Attached'}
                  </p>
                  <p className="text-[11px] text-indigo-700 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Gemini Vision will solve & explain step-by-step</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1.5 rounded-xl bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                title="Remove photo"
                aria-label="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Helper Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-slate-400 font-medium shrink-0">Quick format:</span>
            <button
              type="button"
              onClick={() => setInput((prev) => (prev ? `${prev} Please explain step-by-step with an example.` : 'Please explain step-by-step with an example: '))}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors"
            >
              Step-by-Step
            </button>
            <button
              type="button"
              onClick={() => setInput((prev) => (prev ? `${prev} इसे हिंदी में सरल उदाहरण के साथ समझाइए।` : 'इसे हिंदी में सरल उदाहरण के साथ समझाइए: '))}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-medium transition-colors"
            >
              सरल हिंदी में
            </button>
            <button
              type="button"
              onClick={() => setInput((prev) => (prev ? `${prev} Give me 3 practice quiz questions on this topic.` : 'Give me 3 practice quiz questions on: '))}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium transition-colors"
            >
              Practice Quiz
            </button>
            {simpleMode && (
              <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1">
                <Baby className="w-3 h-3 text-amber-600" /> Simple Language Mode Active
              </span>
            )}
          </div>

          {/* Primary Input Container */}
          <div className="relative flex items-end gap-1.5 sm:gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all shadow-inner">
            {/* Camera / Photo Button with Options Popover */}
            <div className="relative shrink-0 pb-1 pl-1">
              <button
                type="button"
                onClick={() => setIsPhotoMenuOpen(!isPhotoMenuOpen)}
                className={`p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center ${
                  attachedImage 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                title="Attach photo of homework or textbook question"
                aria-label="Upload or take photo"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Photo Input Choice Popover */}
              {isPhotoMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsPhotoMenuOpen(false)} />
                  <div className="absolute bottom-12 left-0 w-52 bg-white rounded-2xl shadow-xl border border-indigo-100 p-2 z-50 space-y-1 animate-fade-in">
                    <p className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Homework Photo (तस्वीर)
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhotoMenuOpen(false);
                        cameraInputRef.current?.click();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>Take Photo with Camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhotoMenuOpen(false);
                        galleryInputRef.current?.click();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span>Choose from Gallery</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                attachedImage 
                  ? 'Ask any specific question about this photo (or just click Send to solve)...' 
                  : 'Ask anything in Hindi, English, or your language (e.g. 2x+5=15 or प्रकाश संश्लेषण)...'
              }
              className="w-full max-h-40 py-2 px-2 text-xs sm:text-sm bg-transparent resize-none focus:outline-none text-slate-900 placeholder:text-slate-400"
              maxLength={2500}
            />

            {/* Action buttons on right */}
            <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
              {/* Mic Speech Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl transition-all active:scale-95 ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Speak your question'}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || (!input.trim() && !attachedImage)}
                className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/25 active:scale-95 flex items-center justify-center"
                title="Send message (Enter)"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Footer Subtext with Shaikh Sahewaz Attribution */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <div className="flex items-center gap-1.5 truncate">
              <span>StudySaathi AI • Created by <strong className="text-slate-600 font-semibold">Shaikh Sahewaz</strong></span>
            </div>
            <span className="shrink-0">
              {input.length} / 2500
            </span>
          </div>
        </div>
      </footer>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Start a New Chat?</h4>
                <p className="text-xs text-slate-500">This will clear your current conversation history.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearChat}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
              >
                Clear & Start New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Practice Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        initialTopic={quizTopic}
        defaultSubject={selectedSubject}
        onAskChatQuestion={(question) => {
          handleSendMessage(question);
        }}
      />

      {/* Safety, Privacy & Creator Attribution Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
