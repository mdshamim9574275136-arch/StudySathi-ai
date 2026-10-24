# StudySaathi AI — real AI answers setup (Netlify)

Chat is connected to a secure Netlify Function. The Gemini API key is read on the server and is **not** placed in browser JavaScript.

## One-time setup
1. Create/get a Gemini API key from Google AI Studio: https://aistudio.google.com/app/apikey . Check Google's current terms, region availability and quotas.
2. Open your Netlify site dashboard.
3. Go to **Site configuration → Environment variables** (sometimes shown under **Environment variables**).
4. Add variable name `GEMINI_API_KEY` and paste the key as its value. Do not put the key in `app.js`, HTML, or a public repository.
5. Redeploy the site by uploading/deploying the **contents** of the `StudySaathi-Premium` folder (not the outer ZIP itself), keeping `netlify.toml` and the `netlify/functions/chat.mjs` path intact. If using Netlify's manual deploy, use a deploy method that supports Netlify Functions; a plain static drag-and-drop deploy may not build functions. Connect the folder/repository to Netlify or use Netlify CLI/build deploy.
6. Open AI Chat and ask a question. It should return an answer; the existing Listen button reads the answer aloud in supported browsers.

## Troubleshooting
- `AI setup is not finished yet`: the environment variable is missing or the site has not been redeployed after adding it.
- `AI is busy or the free quota was reached`: wait and try later, or review Gemini quota/billing settings.
- `AI service could not answer`: check the key, API access and Netlify Function logs.

The Gemini API may have free-tier limits and terms that can change. Keep the key private and monitor usage. The AI can make mistakes; verify important schoolwork facts.
