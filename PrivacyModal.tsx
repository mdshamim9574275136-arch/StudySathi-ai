import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Camera,
  Share2
} from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-indigo-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Safety, Privacy & Academic Integrity</h3>
              <p className="text-xs text-indigo-200">StudySaathi AI • Created by Shaikh Sahewaz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close privacy notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {/* Creator Attribution */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-200/80 text-indigo-950 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-700 text-white flex items-center justify-center font-black text-xs shrink-0">
              SS
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-indigo-950">StudySaathi AI</p>
              <p className="text-xs text-indigo-800">Designed and developed by <strong>Shaikh Sahewaz</strong> as a free, safe educational companion for all students.</p>
            </div>
          </div>

          {/* Principle 1: Camera & Homework Photos Privacy */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950">
            <Camera className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-blue-950 text-xs sm:text-sm">
                Camera & Photo Privacy Guarantee
              </h4>
              <p className="text-blue-900/90 text-xs">
                When you snap or upload a photo of your homework problem, the image is processed purely in server memory by Gemini Vision to extract and solve the question. <strong>Your photos are never stored on any permanent server database or sold.</strong> Camera access is requested only when you choose to snap a photo.
              </p>
            </div>
          </div>

          {/* Principle 2: WhatsApp & Chat Sharing Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
            <Share2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                WhatsApp Sharing Transparency
              </h4>
              <p className="text-emerald-900/90 text-xs">
                The "Share to WhatsApp" feature utilizes the official WhatsApp share link or your device's native share sheet. <strong>StudySaathi never asks for your WhatsApp account, password, or contacts, and cannot read your private chats.</strong> Messages are never delivered automatically without you reviewing and confirming in WhatsApp.
              </p>
            </div>
          </div>

          {/* Principle 3: No secret exposure & local storage safety */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Zero API Key Exposure & Secure Backend
              </h4>
              <p className="text-slate-600 text-xs">
                All requests to Google Gemini AI are executed via our secure server backend. No private keys or authentication tokens are ever sent to the browser or placed in <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-mono text-[11px]">localStorage</code>.
              </p>
            </div>
          </div>

          {/* Principle 4: Academic Ethics */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                Academic Integrity & Exam Policy
              </h4>
              <p className="text-amber-900/90 text-xs">
                StudySaathi AI helps you learn concepts step-by-step. We strictly never make fraudulent promises of "exam paper leaks" or guaranteed predictions. Genuine practice and clarity are the only true path to exam excellence.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Created by Shaikh Sahewaz</span>
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-2xs"
          >
            I Understand (समझ गया)
          </button>
        </div>
      </div>
    </div>
  );
};
