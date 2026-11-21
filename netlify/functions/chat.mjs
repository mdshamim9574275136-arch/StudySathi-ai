
const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers });

function imagePartFromPayload(image) {
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
    if (!match) {
      throw new Error("Photo data is invalid. Please attach the photo again.");
    }
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

  if (raw.length > 2_600_000) {
    throw new Error("Photo is too large. Please crop it and try again.");
  }

  return {
    inlineData: {
      mimeType,
      data: raw,
    },
  };
}

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Use POST to ask a question." }, 405);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return json({
      error: "AI setup is not finished. Please check GEMINI_API_KEY in Netlify."
    }, 503);
  }

  try {
    const body = await req.json();

    const question = String(body.message || body.question || "").trim();
    const imagePart = imagePartFromPayload(body.image);

    if (!question && !imagePart) {
      return json({
        error: "Please type a question or attach a photo first."
      }, 400);
    }

    if (question.length > 4000) {
      return json({
        error: "Please enter a question under 4000 characters."
      }, 400);
    }

    const language = String(body.language || "Auto detect").slice(0, 40);
    const studentClass = String(body.studentClass || "Not specified").slice(0, 30);
    const stream = String(body.stream || "Not specified").slice(0, 40);
    const subject = String(body.subject || "General study help").slice(0, 80);
    const teacher = String(body.teacher || "StudySaathi AI").slice(0, 80);
    const mode = String(body.mode || "Standard").slice(0, 40);
    const simpleMode = Boolean(body.simpleMode);

    if (teacher !== "StudySaathi AI") {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date());

      const hour = Number(parts.find(p => p.type === "hour")?.value || 0);
      const minute = Number(parts.find(p => p.type === "minute")?.value || 0);
      const mins = hour * 60 + minute;

      const isEinstein = /einstein/i.test(teacher);
      const start = isEinstein ? 420 : 720;
      const end = isEinstein ? 1320 : 1200;

      if (mins < start || mins >= end) {
        return json({
          error: `${teacher} is offline right now. Please try during ${isEinstein ? "7 AM–10 PM" : "12 PM–8 PM"} India time.`
        }, 403);
      }
    }

    const systemInstruction = `
You are ${teacher}, a helpful and accurate AI tutor in StudySaathi AI.

You were created for StudySaathi AI by Shaikh Sahewaz.
StudySaathi AI uses Google Gemini AI technology.
If asked who created you, answer clearly:
"StudySaathi AI was created by Shaikh Sahewaz and is powered by Google Gemini AI."
Never claim that Google created the StudySaathi website.

Student class: ${studentClass}
Stream: ${stream}
Subject: ${subject}
Explanation style: ${mode}
Simple mode: ${simpleMode ? "on" : "off"}

LANGUAGE:
Selected language: ${language}.
If Auto detect, use the language of the student's question.
Otherwise answer entirely in the selected language.

PHOTO / IMAGE INSTRUCTIONS:
When a photo is attached, inspect the actual image.
Read all clearly visible questions, numbers, diagrams and tables.
Give direct answers in the same order.
Show short step-by-step working when useful.
Answer every readable question instead of only describing the image.
If some text is unclear, answer the readable questions and identify the unclear part.
Never say that no photo was attached when image data is present.
Never invent unreadable questions or answers.

For maths and science, explain calculations and units.
For other subjects, give accurate, student-friendly answers.
Keep responses age-appropriate.
`;

    const userParts = [{
      text: question || "Read this homework photo and give direct answers to all clearly visible questions in order. Show concise working where needed."
    }];

    if (imagePart) {
      userParts.push(imagePart);
    }

    const history = Array.isArray(body.history)
      ? body.history.slice(-6)
      : [];

    const contents = [];

    for (const item of history) {
      const role = item?.role === "model" ? "model" : "user";
      const text = String(item?.text || "").slice(0, 1500);

      if (text) {
        contents.push({
          role,
          parts: [{ text }]
        });
      }
    }

    contents.push({
      role: "user",
      parts: userParts
    });

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents,
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 1800
          }
        })
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error("Gemini API error", upstream.status, JSON.stringify(data).slice(0, 1000));

      if (upstream.status === 429) {
        return json({
          error: "Gemini free quota is temporarily exhausted. Please wait and try again."
        }, 429);
      }

      return json({
        error: "Gemini could not process this request. Please check API key and model access."
      }, 502);
    }

    const answer = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("\n")
      .trim();

    if (!answer) {
      return json({
        error: "Gemini returned no readable answer. Please try a clearer photo."
      }, 502);
    }

    return json({
      reply: answer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("StudySaathi chat function error", error);

    return json({
      error: error instanceof Error
        ? error.message
        : "Could not process your request. Please try again."
    }, 400);
  }
};
                  
