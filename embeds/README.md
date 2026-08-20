# Courses-by-Exam Embed

`embeds/courses-by-exam.html` is a paste-anywhere widget (a `<div>` + one
`<script>`) that shows a "browse courses by exam" dropdown + card grid,
rendered inside a sandboxed same-origin iframe so its CSS/JS can't clash
with the host page.

## Before you paste this anywhere

Set `window.__tbProxyBase` to your deployed proxy URL **before** this
script runs:

```html
<script>window.__tbProxyBase = "https://ssc-proxy-xxxx.onrender.com";</script>
<!-- then paste embeds/courses-by-exam.html contents below -->
```

If you don't set it, the widget shows "Widget not configured" instead of
silently failing or falling back to a hardcoded credential.

## Why there's no token anywhere in this file

An earlier draft of this widget had a real auth token hardcoded as a
`FALLBACK` constant directly in the browser-side script. That's a hard
no — anything shipped to the browser is readable via view-source, so a
token embedded there is effectively public. This version calls **your own
proxy** (`server/index.js`) instead of `api-new.testbook.com` directly;
the proxy is the only place that ever touches the real token, and it
reads that from a server-side environment variable, never from code.

If you ever see a real token in a file about to be embedded on a public
page, stop and route it through a proxy instead — same reasoning as the
rest of this repo's README.
