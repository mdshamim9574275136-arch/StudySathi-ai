const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST to ask a question." }), { status: 405, headers });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI setup is not finished yet. Add GEMINI_API_KEY in Netlify → Site configuration → Environment variables, then redeploy." }), { status: 503, headers });
  }
  try {
    const body = await req.json();
    const question = String(body.question || "").trim();
    if (!question || question.length > 4000) {
      return new Response(JSON.stringify({ error: "Please enter a question (maximum 4000 characters)." }), { status: 400, headers });
    }
    const language = String(body.language || "Auto detect").slice(0, 40);
    const studentClass = String(body.studentClass || "Not specified").slice(0, 30);
    const stream = String(body.stream || "Not specified").slice(0, 40);
    const subject = String(body.subject || "General study help").slice(0, 80);
    const teacher = String(body.teacher || "StudySaathi AI").slice(0, 80);
    // Teacher-specific chats are available only during their published IST hours.
    if (teacher !== "StudySaathi AI") {
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      const hour = Number(parts.find(p => p.type === "hour")?.value || 0);
      const minute = Number(parts.find(p => p.type === "minute")?.value || 0);
      const mins = hour * 60 + minute;
      const isEinstein = /einstein/i.test(teacher);
      const start = isEinstein ? 7 * 60 : 12 * 60;
      const end = isEinstein ? 22 * 60 : 20 * 60;
      if (mins < start || mins >= end) {
        return new Response(JSON.stringify({ error: `${teacher} is offline right now. Please try during ${isEinstein ? "7 AM–10 PM" : "12 PM–8 PM"} India time.` }), { status: 403, headers });
      }
    }
    const systemInstruction = `You are ${teacher}, a kind, accurate and encouraging AI tutor in StudySaathi AI. Help students learn; explain clearly with steps and examples. Student class: ${studentClass}. Stream: ${stream}. Subject: ${subject}. MANDATORY RESPONSE LANGUAGE: ${language}. If the selected language is not Auto detect/auto, write the entire answer only in that language (including headings, examples, and explanations); do not default to English. If language is Auto detect/auto, answer in the language the student used. Keep formulas and standard technical terms when helpful, but explain them in the selected language. For maths/science, show steps and check units. For class 11–12 Commerce, support Accountancy, Business Studies and Economics. For Science, support Physics, Chemistry, Biology and Mathematics. Never pretend to know something you do not know; state uncertainty and correct mistakes. Keep answers age-appropriate. Do not claim to be a human teacher. Format answers in readable plain text.`;
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 1200 },
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      console.error("Gemini API error", upstream.status, JSON.stringify(data).slice(0, 1200));
      return new Response(JSON.stringify({ error: upstream.status === 429 ? "AI is busy or the free quota was reached. Please try again shortly." : "AI service could not answer right now. Check the Gemini API key and try again." }), { status: 502, headers });
    }
    const answer = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("\n").trim();
    if (!answer) return new Response(JSON.stringify({ error: "AI returned an empty answer. Please try asking another way." }), { status: 502, headers });
    return new Response(JSON.stringify({ answer }), { status: 200, headers });
  } catch (err) {
    console.error("Chat function error", err);
    return new Response(JSON.stringify({ error: "Could not connect to the AI service. Please check your internet and try again." }), { status: 500, headers });
  }
};
