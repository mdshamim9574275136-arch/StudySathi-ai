const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers });

function extractImage(image) {
  if (!image) return null;
  let mimeType = "image/jpeg";
  let raw = "";
  if (typeof image === "string") {
    raw = image;
  } else if (typeof image === "object") {
    mimeType = String(image.mimeType || image.type || mimeType).toLowerCase();
    raw = String(image.data || image.base64 || "");
  }
  if (raw.startsWith("data:")) {
    const match = raw.match(/^data:([^;,]+);base64,([\s\S]+)$/i);
    if (!match) throw new Error("The photo data could not be read. Please attach it again.");
    mimeType = match[1].toLowerCase();
    raw = match[2];
  }
  raw = raw.replace(/\s/g, "");
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)) {
    throw new Error("Please upload a JPG, PNG or WEBP photo.");
  }
  if (!raw || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) {
    throw new Error("The attached photo is empty or invalid. Please attach it again.");
  }
  // Keep below Netlify's function request-body ceiling.
  if (raw.length > 2_600_000) throw new Error("Photo is too large to process. Please crop it or choose a smaller image.");
  return { inlineData: { mimeType, data: raw } };
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST to ask a question." }, 405);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: "AI setup is incomplete. Please ask the site administrator to check GEMINI_API_KEY in Netlify." }, 503);

  try {
    const body = await req.json();
    const question = String(body.message || body.question || "").trim();
    const imagePart = extractImage(body.image);
    if (!question && !imagePart) return json({ error: "Type a question or attach a photo first." }, 400);
    if (question.length > 4000) return json({ error: "Please keep your question under 4000 characters." }, 400);

    const language = String(body.language || "Auto detect").slice(0, 40);
    const subject = String(body.subject || "General study help").slice(0, 80);
    const mode = String(body.mode || "Standard").slice(0, 40);
    const simpleMode = Boolean(body.simpleMode);
    const systemInstruction = `You are StudySaathi AI, a friendly and accurate educational assistant on the StudySaathi AI website.\nIDENTITY: If asked who made, created, developed or built you, answer directly: “StudySaathi AI was created by Shaikh Sahewaz and is powered by Google Gemini AI.” Do not say Google created the StudySaathi website. Do not claim to be human.\nSTUDY HELP: Give the direct answer first, then a clear explanation. For maths and science, show the necessary working. If the student asks a general question, answer it directly rather than redirecting them to study. Subject: ${subject}. Explanation style: ${mode}. Simple mode: ${simpleMode ? "on" : "off"}.\nLANGUAGE: ${language.toLowerCase() === "auto" || language.toLowerCase() === "auto detect" ? "Reply in the language used by the student." : `Reply in ${language}.`} Keep the whole answer in that language unless a technical term needs to remain.\nIMAGE HANDLING: When an image is attached, you MUST inspect the supplied image data, not assume it is missing. Read the visible question(s), numbers, labels and diagrams. Give direct answers to every clearly readable question in order, with concise steps. If only some parts are readable, answer those and identify only the unclear parts. Never invent unreadable text or claim to have seen content that is not present. Do not tell the student to re-upload when an image part is present and readable.\nKeep all explanations age-appropriate and respectful.`;

    const userParts = [];
    userParts.push({ text: question || "Read this homework photo. Give direct answers to all clearly visible questions in order, and show concise working." });
    if (imagePart) userParts.push(imagePart);

    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const contents = [];
    for (const item of history) {
      const role = item?.role === "model" ? "model" : "user";
      const text = String(item?.text || "").slice(0, 1500);
      if (text) contents.push({ role, parts: [{ text }] });
    }
    contents.push({ role: "user", parts: userParts });

    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.25, maxOutputTokens: 1800 },
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      console.error("Gemini API error", upstream.status, JSON.stringify(data).slice(0, 900));
      if (upstream.status === 429) return json({ error: "Gemini free quota is temporarily exhausted. Please wait and try again later." }, 429);
      return json({ error: "Gemini could not process this request. Please check the API key/model access and try again." }, 502);
    }
    const answer = (data.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("\n").trim();
    if (!answer) return json({ error: "No readable answer was returned. Please try a clearer photo or ask the question in text." }, 502);
    return json({ reply: answer, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("StudySaathi chat error", error);
    return json({ error: error instanceof Error ? error.message : "Could not process your request. Please try again." }, 400);
  }
};
