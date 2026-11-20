# StudySaathi AI redesign update

## What's changed
- Added six original cartoon SVG teacher portraits for Maths, Science, English, Social Science, Coding, and Exam Coach.
- Rebuilt the teacher selector as a responsive, colorful teacher-card gallery.
- Each teacher now has an independent chat session. Switching teachers opens that teacher's own conversation; General AI chat is separate.
- Chat history for each teacher is kept separately in the current browser session.
- The selected teacher's cartoon portrait and name appear beside their AI replies.
- The chat API now receives the teacher's subject-specialist role and recent conversation history, so follow-up questions stay in context.
- AI teacher chats are available 24/7; the previous server-side teacher-hour block has been removed.
- Fixed incorrect local type-import paths and added the missing type imports in the main app.

## Deploy
1. Upload this project to your Git repository or replace the files in the existing repository.
2. In Netlify, keep the build command as `npm run build` and publish directory as `dist`.
3. Keep `GEMINI_API_KEY` configured in Netlify environment variables.
4. Trigger a new deploy.

The dependency installation/build could not be run in this workspace because the package registry was unreachable. TypeScript/JSX syntax checks and SVG/XML checks passed; run the normal Netlify build to perform the full dependency-backed build.
