// server/index.js
// Minimal proxy: browser never sees the real auth token.
// Requires Node 18+ (built-in fetch). Run: node index.js

import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8787;
const TESTBOOK_AUTH_TOKEN = process.env.TESTBOOK_AUTH_TOKEN; // set in .env, never commit
const PROXY_SHARED_SECRET = process.env.PROXY_SHARED_SECRET; // optional simple gate

if (!TESTBOOK_AUTH_TOKEN) {
  console.warn("WARNING: TESTBOOK_AUTH_TOKEN is not set. Requests will fail.");
}

// Restrict to your own frontend origin(s) in production.
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));

// Very small rate limiter so a leaked proxy URL can't be hammered.
const hits = new Map();
app.use((req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const windowMs = 60_000;
  const entry = hits.get(key) || { count: 0, reset: now + windowMs };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs; }
  entry.count += 1;
  hits.set(key, entry);
  if (entry.count > 30) return res.status(429).json({ error: "Too many requests" });
  next();
});

app.get("/search/global", async (req, res) => {
  if (PROXY_SHARED_SECRET && req.header("x-proxy-secret") !== PROXY_SHARED_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const term = req.query.term;
  if (!term) return res.status(400).json({ error: "Missing 'term' query param" });

  const searchOn = "targets,freeTests,pyp,quizzes,testSeries,tests,articles,courses,videos,goalCards";

  const upstreamUrl =
    `https://api-new.testbook.com/api/v1/search/global` +
    `?auth_code=${encodeURIComponent(TESTBOOK_AUTH_TOKEN)}` +
    `&X-Tb-Client=web,1.3` +
    `&language=English` +
    `&term=${encodeURIComponent(term)}` +
    `&searchObj=global` +
    `&searchOn=${encodeURIComponent(searchOn)}`;

  try {
    const upstream = await fetch(upstreamUrl, { headers: { Accept: "application/json" } });
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream error ${upstream.status}` });
    }
    const json = await upstream.json();
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Upstream fetch failed" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Exam Kit proxy listening on :${PORT}`));
