const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST to generate a practice quiz." }), { status: 405, headers });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI setup is not finished. Add GEMINI_API_KEY in Netlify environment variables and redeploy." }), { status: 503, headers });
  }

  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim().slice(0, 200);
    const subject = String(body.subject || "General Studies").slice(0, 100);
    const language = String(body.language || "English").slice(0, 40);

    if (!topic) {
      return new Response(JSON.stringify({ error: "Please enter a topic for your practice quiz." }), { status: 400, headers });
    }

    const prompt = `Create exactly 3 multiple-choice practice questions for a student.
Topic: ${topic}
Subject: ${subject}
Language: ${language}

Return ONLY a valid JSON array. Each item must contain:
{"id":1,"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correctIndex":0,"explanation":"...","hint":"..."}
Rules: options must contain exactly 4 strings; correctIndex must be 0, 1, 2, or 3; explanations and hints must use the requested language. Do not include markdown fences or text outside the JSON array.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "You are StudySaathi AI, an accurate and encouraging school quiz creator. Return valid JSON only." }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1800, responseMimeType: "application/json" },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini quiz API error", response.status, JSON.stringify(data).slice(0, 1000));
      const status = response.status === 429 ? 429 : 502;
      const message = response.status === 429
        ? "Practice quiz is busy or the free Gemini quota was reached. Please try again shortly."
        : "Practice quiz could not be generated right now. Please try again.";
      return new Response(JSON.stringify({ error: message }), { status, headers });
    }

    const raw = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
    let quiz;
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      quiz = JSON.parse(cleaned);
    } catch {
      console.error("Gemini returned invalid quiz JSON", raw.slice(0, 800));
      return new Response(JSON.stringify({ error: "Quiz questions could not be read. Please try generating them again." }), { status: 502, headers });
    }

    if (!Array.isArray(quiz) || quiz.length === 0) {
      return new Response(JSON.stringify({ error: "No practice questions were returned. Please try another topic." }), { status: 502, headers });
    }

    const validQuiz = quiz.slice(0, 3).filter(q =>
      q &&
      typeof q.question === "string" &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex <= 3
    ).map((q, i) => ({
      id: i + 1,
      question: q.question,
      options: q.options.map(String),
      correctIndex: q.correctIndex,
      explanation: String(q.explanation || ""),
      hint: String(q.hint || ""),
    }));

    if (!validQuiz.length) {
      return new Response(JSON.stringify({ error: "The generated questions were incomplete. Please try again." }), { status: 502, headers });
    }

    return new Response(JSON.stringify({ topic, quiz: validQuiz }), { status: 200, headers });
  } catch (err) {
    console.error("Quiz function error", err);
    return new Response(JSON.stringify({ error: "Could not connect to the quiz service. Please try again." }), { status: 500, headers });
  }
};
