import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  User, 
  Award, 
  Share2, 
  Maximize2,
  X
} from 'lucide-react';
import { marked } from 'marked';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  onGenerateQuizFromTopic?: (topic: string) => void;
}

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onGenerateQuizFromTopic,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner speech
    const cleanText = message.text
      .replace(/[*#`_~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .slice(0, 800);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const hasHindi = /[\u0900-\u097F]/.test(cleanText);
    utterance.lang = hasHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Build educational WhatsApp share content
  const cleanSnippet = message.text
    .replace(/[#`]/g, '')
    .slice(0, 1400);

  const shareText = `📚 *StudySaathi AI Study Notes*\n\n${cleanSnippet}\n\n✨ *Created by Shaikh Sahewaz*\n🔗 Open StudySaathi AI: ${typeof window !== 'undefined' ? window.location.origin : ''}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleNativeShare = async (e: React.MouseEvent) => {
    // If mobile device supports navigator.share, trigger native share sheet
    if (typeof navigator !== 'undefined' && navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      e.preventDefault();
      try {
        await navigator.share({
          title: 'StudySaathi AI Study Notes',
          text: shareText,
        });
      } catch {
        // Fallback: let standard href to WhatsApp open
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 3000);
      }
    } else {
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 3500);
    }
  };

  const renderContent = () => {
    if (isUser) {
      return (
        <div className="space-y-2">
          {/* User's homework photo attachment */}
          {message.image && (
            <div className="relative group max-w-xs overflow-hidden rounded-xl border border-white/20 shadow-sm bg-black/20">
              <img
                src={message.image.data.startsWith('data:') ? message.image.data : `data:${message.image.mimeType};base64,${message.image.data}`}
                alt="Homework or study problem photo"
                className="w-full max-h-56 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsImageModalOpen(true)}
              />
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm"
                title="View full photo"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {message.text && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-white">
              {message.text}
            </div>
          )}
        </div>
      );
    }

    try {
      const htmlContent = marked.parse(message.text) as string;
      return (
        <div
          className="prose-educational text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    } catch {
      return (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {message.text}
        </div>
      );
    }
  };

  const firstLine = message.text.split('\n')[0].replace(/[*#]/g, '').trim();
  const couldHaveQuiz = !isUser && message.text.length > 150 && onGenerateQuizFromTopic;

  return (
    <>
      <div className={`flex w-full gap-2 sm:gap-3 my-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {/* Avatar for AI: Stylized SS logo badge */}
        {!isUser && (
          <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-700 via-purple-700 to-indigo-900 flex items-center justify-center text-white shadow-xs mt-0.5 border border-indigo-300/40">
            <span className="font-black text-[11px] tracking-tight">SS</span>
          </div>
        )}

        {/* Message Card */}
        <div
          className={`relative max-w-[92%] sm:max-w-[82%] rounded-2xl px-4 py-3.5 shadow-xs transition-all ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white rounded-tr-xs'
              : 'bg-white border border-indigo-100 text-slate-800 rounded-tl-xs shadow-slate-100/60'
          }`}
        >
          {/* Assistant Header Tag with Shaikh Sahewaz Attribution */}
          {!isUser && (
            <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-indigo-50 text-[11px] font-semibold text-indigo-700">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>StudySaathi Tutor</span>
                <span className="text-slate-400 font-normal text-[10px] hidden xs:inline">• by Shaikh Sahewaz</span>
              </span>
              <span className="text-slate-400 font-normal text-[10px]">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* Message Body */}
          {renderContent()}

          {/* Action Toolbar for AI message */}
          {!isUser && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3.5 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Copy Answer Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 active:scale-95 transition-all border border-slate-200/60 shadow-2xs"
                  title="Copy complete answer to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span className="text-[11px] font-medium">{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                {/* WhatsApp Share Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleNativeShare}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-200 transition-all active:scale-95 shadow-2xs"
                  title="Share this answer with your study group or friends on WhatsApp"
                >
                  {/* WhatsApp SVG Icon */}
                  <svg className="w-3.5 h-3.5 fill-emerald-600 shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.971.53 1.83.813 2.796.814 3.183 0 5.769-2.587 5.769-5.768 0-3.181-2.587-5.767-5.769-5.767zm3.392 8.232c-.146.415-.852.795-1.189.848-.337.054-.77.079-1.252-.077-.482-.156-1.109-.43-1.879-1.099-.77-.669-1.287-1.488-1.442-1.745-.155-.257-.017-.396.12-.533.123-.123.275-.318.412-.477.137-.159.183-.272.275-.453.091-.182.046-.341-.023-.478-.069-.136-.615-1.482-.843-2.029-.221-.532-.446-.46-.614-.469-.159-.008-.341-.01-.523-.01-.182 0-.477.068-.727.341-.25.273-.955.933-.955 2.274s.977 2.637 1.114 2.819c.137.182 1.923 2.937 4.658 4.119 2.735 1.182 2.735.788 3.228.742.493-.046 1.583-.647 1.808-1.272.225-.625.225-1.159.158-1.273-.067-.113-.249-.181-.395-.25z"/>
                  </svg>
                  <span>Share on WhatsApp</span>
                </a>

                {/* Read Aloud Speech Button */}
                {'speechSynthesis' in window && (
                  <button
                    type="button"
                    onClick={handleSpeech}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all active:scale-95 border border-slate-200/60 ${
                      isSpeaking ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                    title={isSpeaking ? 'Stop speaking' : 'Read answer aloud'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-indigo-600" /> : <Volume2 className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="text-[11px] font-medium">{isSpeaking ? 'Stop' : 'Listen'}</span>
                  </button>
                )}
              </div>

              {/* Quick Practice button */}
              {couldHaveQuiz && (
                <button
                  type="button"
                  onClick={() => onGenerateQuizFromTopic?.(firstLine.slice(0, 60))}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-[11px] transition-colors border border-purple-200/80 shadow-2xs"
                  title="Generate practice quiz on this topic"
                >
                  <Award className="w-3 h-3 text-purple-600" />
                  <span>Practice Quiz</span>
                </button>
              )}
            </div>
          )}

          {/* User Timestamp */}
          {isUser && (
            <div className="text-right mt-1 text-[10px] text-indigo-200">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}

          {/* WhatsApp share guidance notice */}
          {shareFeedback && (
            <div className="mt-2 p-2 rounded-lg bg-emerald-50 text-emerald-900 text-[11px] border border-emerald-200 flex items-center gap-1.5 animate-fade-in">
              <span>Opening WhatsApp. You can choose which friend or study group to send this note to.</span>
            </div>
          )}
        </div>

        {/* Avatar for User */}
        {isUser && (
          <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs mt-0.5">
            <User className="w-4 h-4 text-slate-600" />
          </div>
        )}
      </div>

      {/* Fullscreen Photo Modal for homework inspection */}
      {isImageModalOpen && message.image && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
              aria-label="Close enlarged photo"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={message.image.data.startsWith('data:') ? message.image.data : `data:${message.image.mimeType};base64,${message.image.data}`}
              alt="Homework full preview"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            {message.image.name && (
              <p className="text-white/80 text-xs mt-2 font-medium">{message.image.name}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
