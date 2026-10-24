import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security & Parsing (supports image uploads up to 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Rate Limiter for Abuse Protection
// Allows max 25 requests per minute per IP
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25;

const rateLimiter = (req: Request, res: Response, next: () => void) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
    res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS_PER_WINDOW - 1);
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before asking another question.',
      retryAfterSeconds,
    });
  }

  record.count += 1;
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS_PER_WINDOW - record.count);
  next();
};

// Periodically clean up old rate limit records
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('[StudySaathi AI Server] Warning: GEMINI_API_KEY is not defined in environment variables.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const STUDY_SAATHI_SYSTEM_PROMPT = `
You are "StudySaathi AI" (स्टडी साथी), created by Shaikh Sahewaz. You are a warm, encouraging, brilliant, and patient personal study companion designed for school and college students (CBSE, ICSE, State Boards, NCERT, and foundational competitive exams).

Key Mission & Pedagogical Principles:
1. Explain difficult concepts in simple, step-by-step fashion.
2. Use relatable everyday analogies (cricket, cooking, smartphones, playground games, trains).
3. For Math and Science calculations:
   - State: "Given Data", "Formula / Theorem", "Step-by-step Substitution", and "Final Answer with Units".
   - Double check all calculations.
4. Homework & Photo / Diagram Input:
   - When a student uploads a photo of textbook questions, handwritten maths problems, or science diagrams, carefully read the text/diagram in the image.
   - Restate the identified problem clearly: "I see your question: [Problem text]".
   - Provide the complete, structured step-by-step solution, explaining formulas and intermediate steps clearly.
5. Language Adaptability:
   - If a specific language is requested, respond fully and naturally in that language (Hindi, English, Hinglish, Gujarati, Bengali, Marathi, Tamil, Telugu, Urdu, Punjabi, Kannada, Malayalam, Odia, etc.).
   - Otherwise, automatically detect and reply in the EXACT language used by the student.
   - For younger students in Simple Mode, use short, cheerful sentences, child-friendly storytelling, and zero intimidating academic jargon.
6. Interactive Learning:
   - Provide clear bullet points, bold key terms, and neatly formatted formulas.
   - At the end of every conceptual explanation, include a quick "🎯 Quick Check / Practice Question" so the student can test their understanding.
7. Important Integrity & Safety Guardrail:
   - NEVER promise, predict, or guarantee that specific questions will appear in board/school exams (no "100% leaked paper" or "guaranteed questions").
   - Explicitly guide students: "Exams test true conceptual clarity. While past papers help you understand question patterns, genuine practice is your superpower!"
8. Tone:
   - Motivating, respectful, kind, and supportive (like an inspiring mentor or elder sibling). Celebrate curiosity!
`;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    appName: 'StudySaathi AI',
    creator: 'Shaikh Sahewaz',
    model: 'gemini-3.8-flash',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Curated subjects & suggested queries
app.get('/api/subjects', (_req: Request, res: Response) => {
  res.json({
    subjects: [
      {
        id: 'maths',
        name: 'Mathematics',
        nameHindi: 'गणित',
        icon: 'Calculator',
        color: 'from-blue-600 to-indigo-600',
        prompts: [
          'Explain Pythagoras theorem with a real-life example and proof',
          'Solve quadratic equation: 2x² - 7x + 3 = 0 step-by-step',
          'How does compound interest work? Explain with a formula and example',
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
    ],
  });
});

// Helper to call Gemini models with resilient retry on transient 503 / 429
async function generateEducationalContentWithRetry(callContents: any, config: any) {
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await ai.models.generateContent({
          model,
          contents: callContents,
          config,
        });
      } catch (err: any) {
        lastError = err;
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          err?.message?.includes('503') ||
          err?.message?.includes('high demand') ||
          err?.message?.includes('UNAVAILABLE') ||
          err?.message?.includes('DEADLINE_EXCEEDED');

        if (!isTransient) {
          throw err;
        }

        // Brief backoff before next attempt
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }
  }

  throw lastError;
}

// Language name mapping helper
const LANGUAGE_NAMES: Record<string, string> = {
  hi: 'Hindi (हिंदी)',
  hinglish: 'Hinglish (Conversational Hindi written in English/Latin letters)',
  en: 'English',
  gu: 'Gujarati (ગુજરાતી)',
  bn: 'Bengali (বাংলা)',
  mr: 'Marathi (मराठी)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  ur: 'Urdu (اردو)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  or: 'Odia (ଓଡ଼ିଆ)',
};

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

// Chat endpoint
app.post('/api/chat', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { 
      message, 
      history = [], 
      subject, 
      mode, 
      image, 
      language = 'auto', 
      simpleMode = false,
      teacherRole
    } = req.body;

    // Check if an image is provided
    let hasImage = false;
    let cleanImageBase64 = '';
    let imageMimeType = '';

    if (image && typeof image === 'object') {
      if (!image.data || typeof image.data !== 'string') {
        return res.status(400).json({ error: 'Invalid image format: image data is missing.' });
      }

      imageMimeType = (image.mimeType || 'image/jpeg').toLowerCase();
      if (!ALLOWED_IMAGE_TYPES.has(imageMimeType)) {
        return res.status(400).json({
          error: `Unsupported image format (${imageMimeType}). Please upload a JPG, PNG, WEBP, or GIF image.`,
        });
      }

      // Strip potential data URL prefix
      cleanImageBase64 = image.data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();

      // Check size limit (max ~7MB base64 which is ~5MB file)
      if (cleanImageBase64.length > 7.5 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Image is too large (maximum size is 5MB). Please crop or compress your photo before sending.',
        });
      }

      hasImage = true;
    }

    // Message validation: If image is uploaded, message is optional (with a friendly default)
    let userQuery = typeof message === 'string' ? message.trim() : '';

    if (!userQuery && !hasImage) {
      return res.status(400).json({ error: 'Please enter a question or upload a photo of your homework.' });
    }

    if (userQuery.length > 2500) {
      return res.status(400).json({ error: 'Question exceeds maximum length of 2500 characters.' });
    }

    if (!userQuery && hasImage) {
      userQuery = 'Please carefully inspect this study/homework photo, identify the problem or question, and explain the step-by-step solution.';
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check your environment variables.',
      });
    }

    // Format previous turns safely (max 10 recent messages)
    const validHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const item of recentHistory) {
        if (
          item &&
          (item.role === 'user' || item.role === 'model') &&
          typeof item.text === 'string' &&
          item.text.trim().length > 0
        ) {
          validHistory.push({
            role: item.role,
            parts: [{ text: item.text.slice(0, 2000) }],
          });
        }
      }
    }

    // Instruction augmentations
    let promptInstruction = '';

    if (subject) {
      promptInstruction += `[Subject: ${subject}]. `;
    }

    if (typeof teacherRole === 'string' && teacherRole.trim().length > 0) {
      promptInstruction += `[AI TEACHER PERSONA: Act as a ${teacherRole.trim().slice(0, 180)}. Be encouraging, accurate, age-appropriate, and invite the student to ask follow-up questions.] `;
    }

    // Language direction
    if (language && language !== 'auto' && LANGUAGE_NAMES[language]) {
      promptInstruction += `[RESPONSE LANGUAGE: Respond completely in ${LANGUAGE_NAMES[language]}. Use natural and fluent expression of this language with key scientific/mathematical terms provided in English in brackets.] `;
    }

    // Simple language mode for younger students (Class 1-8)
    if (simpleMode) {
      promptInstruction += `[SIMPLE LANGUAGE MODE: The student requested a simple explanation for young learners (Class 1-8). Use short, clear sentences, cheerful everyday examples, and avoid difficult technical jargon.] `;
    }

    if (mode === 'quiz') {
      promptInstruction += `[Focus: Provide a fun 3-question quiz with multiple choice options A, B, C, D on this topic, and provide the answers hidden below or at the end with concise explanations.] `;
    } else if (mode === 'stepbystep') {
      promptInstruction += `[Focus: Break down this topic in distinct numbered steps with an analogy and a practical problem.] `;
    } else if (mode === 'simplify') {
      promptInstruction += `[Focus: Explain this concept as simply as possible for a beginner with no jargon, using a funny or memorable everyday story.] `;
    }

    const userMessageContent = promptInstruction
      ? `${promptInstruction}\n\nStudent Query: ${userQuery}`
      : userQuery;

    // Construct the user parts (with image if provided)
    const userParts: any[] = [];
    if (hasImage) {
      userParts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: cleanImageBase64,
        },
      });
    }
    userParts.push({ text: userMessageContent });

    // Send full conversation contents to generateContent
    const contents: Array<{ role: 'user' | 'model'; parts: any[] }> = [
      ...validHistory,
      {
        role: 'user',
        parts: userParts,
      },
    ];

    const response = await generateEducationalContentWithRetry(contents, {
      systemInstruction: STUDY_SAATHI_SYSTEM_PROMPT,
      temperature: 0.7,
    });

    const replyText = response.text || 'I could not generate a response. Please try rephrasing your question.';

    return res.json({
      reply: replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[StudySaathi AI] Error calling Gemini API:', error?.message || error);
    
    // Check for quota or rate limits
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'Gemini AI service is currently busy handling many student requests. Please wait 10-15 seconds and try again.',
      });
    }

    return res.status(500).json({
      error: 'An error occurred while generating your study explanation. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
});

// Quiz Generator endpoint for instant interactive practice
app.post('/api/quiz-generate', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { topic, subject, language = 'English' } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Generate a 3-question interactive multiple choice practice quiz for a student on the topic "${topic.trim()}" in subject "${subject || 'General Studies'}".
Preferred language: ${language}.
Format your response strictly as valid JSON array of objects without markdown formatting or code block backticks.
Each object must have:
- "id": number (1, 2, 3)
- "question": string
- "options": array of 4 strings (e.g. ["A) ...", "B) ...", "C) ...", "D) ..."])
- "correctIndex": number (0 for A, 1 for B, 2 for C, 3 for D)
- "explanation": string (explaining why this is correct and what the concept means)
- "hint": string (a short encouraging clue without giving away the direct answer)`;

    const response = await generateEducationalContentWithRetry(prompt, {
      systemInstruction: 'You are an educational quiz master. Output strictly valid JSON arrays of quiz objects.',
      responseMimeType: 'application/json',
    });

    let quizData = [];
    try {
      const rawText = response.text || '[]';
      quizData = JSON.parse(rawText);
    } catch {
      quizData = [];
    }

    return res.json({
      topic,
      quiz: quizData,
    });
  } catch (error: any) {
    console.error('[StudySaathi AI] Quiz generate error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to generate practice quiz.' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 StudySaathi AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
