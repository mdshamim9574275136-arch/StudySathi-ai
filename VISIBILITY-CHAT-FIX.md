StudySaathi AI - Teacher Image, Readability & Chat Navigation Fix

Changes in this update:
- Added the teacher SVG avatars to public/teacher-avatars so Vite/Netlify serves them at /teacher-avatars/<teacher>.svg.
- Kept the existing teacher avatar source folder for reference.
- Increased teacher card text sizes and contrast for mobile screens.
- Selecting a teacher now scrolls directly to that teacher's private chat area.
- Added a visible active-teacher banner above the chat.

Deploy:
1. Replace the existing repository project files with the contents of this folder (keep the files at the repository root).
2. Preserve the GEMINI_API_KEY environment variable in Netlify.
3. Deploy the site. Netlify build settings remain: npm run build, publish directory dist.
