import React, { useState } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  MessageSquare,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  defaultSubject?: string | null;
  onAskChatQuestion: (question: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  initialTopic = '',
  defaultSubject = null,
  onAskChatQuestion,
}) => {
  const [topic, setTopic] = useState(initialTopic || 'Chemical Reactions');
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateQuiz = async (customTopic?: string) => {
    const searchTopic = customTopic || topic;
    if (!searchTopic.trim()) return;

    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation({});
    setShowHint({});
    setQuizCompleted(false);

    try {
      const res = await fetch('/api/quiz-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: searchTopic,
          subject: defaultSubject || undefined,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      if (Array.isArray(data.quiz) && data.quiz.length > 0) {
        setQuestions(data.quiz);
      } else {
        throw new Error('Could not parse questions. Please try another topic.');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while generating quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (selectedAnswers[questionIdx] !== undefined) return; // already answered

    const newAnswers = { ...selectedAnswers, [questionIdx]: optionIdx };
    setSelectedAnswers(newAnswers);
    setShowExplanation({ ...showExplanation, [questionIdx]: true });

    // Check if this was correct
    const currentQ = questions[questionIdx];
    if (currentQ && optionIdx === currentQ.correctIndex) {
      // Little sparkle
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.7 },
        });
      } catch {
        // Safe fallback
      }
    }

    // Check if quiz finished
    if (Object.keys(newAnswers).length === questions.length) {
      setTimeout(() => {
        setQuizCompleted(true);
        // Big confetti celebration!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }, 1200);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) score += 1;
    });
    return score;
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-indigo-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Interactive Practice Quiz</h3>
              <p className="text-xs text-indigo-200">Test your conceptual knowledge & memory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close quiz modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Topic Generator Bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Quiz Topic or Concept
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Laws of Motion, Fractions, Tenses, Python Loops..."
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateQuiz()}
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'English' | 'Hindi')}
                className="px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="English">English</option>
                <option value="Hindi">हिंदी (Hindi)</option>
              </select>
              <button
                type="button"
                onClick={() => handleGenerateQuiz()}
                disabled={loading || !topic.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                <span>{questions.length > 0 ? 'Regenerate' : 'Create Quiz'}</span>
              </button>
            </div>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
              <span className="text-[11px] text-slate-400 self-center">Try:</span>
              {['Photosynthesis', 'Pythagoras Theorem', 'English Tenses', 'Newton Laws', 'Periodic Table'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setTopic(tag);
                    handleGenerateQuiz(tag);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-medium transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Generating 3 smart practice questions on "{topic}"...
              </p>
              <p className="text-xs text-slate-400">StudySaathi is formulating options and explanations</p>
            </div>
          )}

          {/* Active Question View */}
          {!loading && questions.length > 0 && !quizCompleted && currentQ && (
            <div className="space-y-4 pt-2">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-100 pb-2">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-indigo-600 font-bold">
                  Score: {calculateScore()}/{questions.length}
                </span>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <p className="text-sm font-bold text-slate-800 leading-snug">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, optIdx) => {
                  const isChosen = selectedAnswers[currentIndex] === optIdx;
                  const isCorrect = optIdx === currentQ.correctIndex;
                  const hasAnswered = selectedAnswers[currentIndex] !== undefined;

                  let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40';

                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                    } else if (isChosen) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400';
                    } else {
                      btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(currentIndex, optIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 shadow-2xs ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {hasAnswered && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Hint Accordion */}
              {currentQ.hint && selectedAnswers[currentIndex] === undefined && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowHint({ ...showHint, [currentIndex]: !showHint[currentIndex] })}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint[currentIndex] ? 'Hide Hint' : 'Need a Hint? (संकेत)'}</span>
                  </button>
                  {showHint[currentIndex] && (
                    <div className="mt-1.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      💡 {currentQ.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Explanation Reveal */}
              {showExplanation[currentIndex] && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 animate-fade-in">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Concept Explanation:</span>
                  </div>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Next Question / Finish navigation */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-xs"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setQuizCompleted(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-xs"
                  >
                    View Final Score
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quiz Completed Summary View */}
          {!loading && quizCompleted && questions.length > 0 && (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex p-4 rounded-3xl bg-indigo-100 text-indigo-700">
                <Award className="w-10 h-10 text-indigo-600" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-slate-900">
                  Quiz Completed! शानदार!
                </h4>
                <p className="text-sm text-slate-500 font-medium">
                  You scored <span className="text-indigo-600 font-extrabold text-lg">{calculateScore()}</span> out of {questions.length} on "{topic}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnswers({});
                    setShowExplanation({});
                    setShowHint({});
                    setCurrentIndex(0);
                    setQuizCompleted(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Quiz</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAskChatQuestion(`Explain "${topic}" in depth with examples and practice problems.`);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask StudySaathi About This Topic</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
