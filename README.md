# NVC OFNR Companion

A minimalist, responsive tool to help people craft an OFNR message (Observation, Feeling, Need, Request) with AI-based validation.

## Tech
- Vite + React + Tailwind
- Netlify Functions (server-side OpenAI call)
- OpenAI model: `gpt-5-nano`

## Quick start (local)
1. Install deps
   ```bash
   npm i
   ```
2. Create a `.env` file in the project root:
   ```bash
   OPENAI_API_KEY=your_key_here
   ```
3. Run:
   ```bash
   npm run dev
   ```
   This uses `netlify dev` so the function is available locally.

If you prefer running only Vite:
```bash
npm run dev:vite
```
…but the AI validation endpoint won’t work unless you also run the Netlify function.

## Deploy (Netlify)
- Connect the repo to Netlify
- Set env var `OPENAI_API_KEY`
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Notes
- The app never sends your API key to the browser.
- Validation prompts are designed to encourage “ownership” (no blame, no diagnosis), and to distinguish emotions/needs from stories/strategies.


## UX
- Single-step flow.
- For free-text inputs, press **Check** to call AI validation.
- When it passes, the button becomes **Next**.
