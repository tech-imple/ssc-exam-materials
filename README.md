# Exam Kit

A generic "exam kit" landing page (free tests, PYPs, quizzes, live tests,
test series, courses, videos, articles) backed by a search-style API,
in the shape of `{ results: { freeTests, pyp, quizzes, ... } }`.

## Structure

```
web/index.html     Frontend. No build step — open it directly or serve statically.
server/index.js     Backend proxy. Attaches the real auth token server-side.
server/.env.example  Template for the token — copy to .env, never commit .env.
```

## Why a backend proxy at all?

The frontend runs in the user's browser. It must never hold a real API
token, because:

- Anything shipped to the browser is visible via "view source" / devtools.
- The upstream API likely blocks direct browser calls via CORS anyway.

So the flow is: **browser → your proxy (holds the token) → upstream API**.

## Run locally

```bash
cd server
cp .env.example .env      # then edit .env and paste a fresh token
npm install
npm start                  # proxy on http://localhost:8787
```

In another terminal, serve the frontend (any static server works):

```bash
cd web
python3 -m http.server 5500
# open http://localhost:5500
```

In the page's config bar, set **Backend proxy base URL** to
`http://localhost:8787` and click **Fetch**. Leave it blank to see the
page run entirely on bundled demo data.

## Safety notes before you push this to GitHub

- `server/.env` is git-ignored — confirm `git status` never shows it.
- Only `server/.env.example` (a template with no real value) should be committed.
- If you deploy the proxy publicly (Render, Fly.io, a VPS, etc.), set
  `PROXY_SHARED_SECRET` and `ALLOWED_ORIGIN` in the host's environment
  variable settings — never in code — and require the header in requests.
- If a real token was ever pasted into a chat, file, or commit, treat it
  as compromised and get a fresh one rather than reusing it.
- Rotate/re-authenticate if you're unsure whether a token has already
  leaked into a repo, log, or screenshot.
