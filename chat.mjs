const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export default async (req) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Use POST to ask a question." }), { status: 405, headers });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: "AI setup is not finished. Add GEMINI_API_KEY in Netlify environment variables and redeploy." }), { status: 503, headers });

  try {
    const body = await req.json();
    const image = body.image;
    let question = String(body.message || body.question || "").trim();
    if (!question && !image) return new Response(JSON.stringify({ error: "Please type a question or attach a photo." }), { status: 400, headers });
    if (question.length > 4000) return new Response(JSON.stringify({ error: "Please keep your question under 4000 characters." }), { status: 400, headers });

    const language = String(body.language || "Auto detect").slice(0, 40);
    const subject = String(body.subject || "General study help").slice(0, 80);
    const mode = String(body.mode || "Explain").slice(0, 40);
    const simpleMode = Boolean(body.simpleMode);
    const systemInstruction = `You are StudySaathi AI, a careful and friendly educational tutor. Identity: You were created for the StudySaathi AI learning website by Shaikh Sahewaz and you use Google Gemini AI technology. If asked who created you, answer clearly: “StudySaathi AI was created by Shaikh Sahewaz and is powered by Google Gemini AI.” Do not claim that Google personally created the StudySaathi website or that you are a human teacher. Help the student understand rather than merely giving unexplained answers. Subject: ${subject}. Mode: ${mode}. Simple explanation mode: ${simpleMode ? "on" : "off"}. Mandatory response language: ${language}. If language is Auto detect, answer in the language used by the student; otherwise answer fully in the selected language.

IMAGE RULES: An image may be supplied as a base64 data URL or as raw base64. If an image is attached, inspect the actual visual content carefully. Do not say the image did not come through if image data is present. Do not respond with generic upload instructions when the image is readable. Give the answer directly first, then explain steps. Read visible text, numbers, diagrams, labels and answer choices. First identify what is visible. Solve only what can be read reliably. If the photo is blurry, cropped, rotated, too dark, or text is unclear, clearly say exactly what cannot be read and ask for a clearer/cropped photo; never invent missing words, numbers or answers. For a worksheet, answer each visible question in order and show understandable steps. For a diagram, describe its parts and explain what it shows. If the user asks a specific question about the image, answer that question using the image. Do not claim to have seen details that are not visible. Keep the response age-appropriate and readable.`;

    const parts = [];
    if (question) parts.push({ text: question });
    else parts.push({ text: "Carefully inspect the attached study/homework photo. Read every visible question and provide the direct answers in order, with concise working where useful. If part is unreadable, answer the readable parts and identify only the unclear part." });

    if (image) {
      let mimeType = String(image.mimeType || image.type || "image/jpeg").toLowerCase();
      let raw = typeof image === "string" ? image : String(image.data || image.base64 || "");
      if (raw.startsWith("data:")) {
        const match = raw.match(/^data:([^;]+);base64,([\s\S]+)$/);
        if (!match) return new Response(JSON.stringify({ error: "Photo format could not be read. Please upload it again as JPG or PNG." }), { status: 400, headers });
        mimeType = match[1].toLowerCase();
        raw = match[2].replace(/\s/g, "");
      } else {
        raw = raw.replace(/\s/g, "");
      }
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)) return new Response(JSON.stringify({ error: "Please upload a JPG, PNG or WEBP photo." }), { status: 400, headers });
      if (!raw) return new Response(JSON.stringify({ error: "The selected photo was empty. Please attach it again." }), { status: 400, headers });
      if (raw.length > 6_500_000) return new Response(JSON.stringify({ error: "This photo is too large. Please crop it or upload a smaller image." }), { status: 413, headers });
      parts.push({ inlineData: { mimeType, data: raw } });
    }

    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.25, maxOutputTokens: 1800 },
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      console.error("Gemini API error", upstream.status, JSON.stringify(data).slice(0, 1000));
      const msg = upstream.status === 429 ? "AI photo/question limit reached for now. Please wait a little and try again." : "AI could not process this request. Please try a clearer photo or check the Gemini API key.";
      return new Response(JSON.stringify({ error: msg }), { status: 502, headers });
    }
    const answer = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("\n").trim();
    if (!answer) return new Response(JSON.stringify({ error: "AI could not read enough from this photo. Please upload a clearer, closer image." }), { status: 502, headers });
    return new Response(JSON.stringify({ reply: answer, timestamp: new Date().toISOString() }), { status: 200, headers });
  } catch (err) {
    console.error("Chat function error", err);
    return new Response(JSON.stringify({ error: "Could not connect to StudySaathi AI. Please check your internet and try again." }), { status: 500, headers });
  }
};
