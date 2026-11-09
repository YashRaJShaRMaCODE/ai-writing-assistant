# Clear Writing

**A calmer workspace for finding the right words.** Rewrite a professional draft or summarise a longer note, then review, copy, download, or continue editing the result.

- **Live app:** <https://clear-writing-studio.onrender.com/>
- **Backend health:** <https://ai-writing-assistant-xfbr.onrender.com/healthz/>

## Data and usage notice

This prototype is for adults (18+) and professional use. Text submitted to the app is sent to Google Gemini. Avoid sensitive, confidential, or personal information. Google’s data-use terms differ between unpaid and paid API usage; unpaid service content may be used to improve Google products and may be reviewed by people. Read the [Gemini API terms](https://ai.google.dev/gemini-api/terms) before handling user content.

The app has no accounts, user-level quotas, or billing controls yet. Its anonymous API limit is a basic abuse guard, not a commercial billing system. Add account-level controls and review provider terms, privacy requirements, and deployment security before offering this as a public paid product.

## What it does

- Rewrite text while preserving its intent, or summarise the key points.
- Choose a clear, warm, direct, or formal output tone for either action.
- Start from a sample draft, see word and character counts, and edit up to 5,000 characters.
- Review results in place, copy or download them, or use one as the next draft.
- Submit only after confirming you are 18+ and agreeing to send text to Google Gemini.
- Show a clear retry message when the anonymous demo request limit is reached; the draft stays in the browser.
- Stop waiting after 45 seconds and keep the draft visible if the service does not respond in time.
- Keep provider API credentials on the backend; the browser receives only the service URL.
- Protect the static frontend with a restrictive Content Security Policy and cache hashed assets for a year.

## Stack

- Django REST Framework backend
- React + Vite frontend
- Google Gemini `generateContent` API

## Local setup

### Backend

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Generate a local Django key and add it to `.env`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Keep `DJANGO_DEBUG=true` only for local development. Add a Gemini key to `GEMINI_API_KEY` to enable AI requests. Then run:

```bash
python manage.py migrate
python manage.py check
python manage.py test api
python manage.py collectstatic --noinput
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/api/rewrite/`; `/healthz/` reports supported modes and styles. It accepts JSON with a `text` field (up to 5,000 characters), `mode` set to `rewrite` or `summarise`, and optional `style` set to `clear`, `warm`, `direct`, or `formal`. Requests are limited to 10 per hour per anonymous IP. The Gemini key stays on the backend and is sent in the `x-goog-api-key` header.

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Vite serves the app at `http://localhost:5173`. Set `VITE_API_URL` in `frontend/.env.local` if the backend uses another address. Only put public configuration in Vite variables; they are included in browser code.

Run frontend checks with:

```bash
npm run lint
npm run build
```

## Production and privacy

The browser sends text to the backend only after the user selects **Rewrite** or **Summarise** and confirms both consent checkboxes. The backend forwards it to Google Gemini. The application does not store submitted text, but Google’s data-use terms differ between unpaid and paid API usage; on unpaid API usage, prompts and responses may be used to improve Google products and may be reviewed by people. Read the [Gemini API terms](https://ai.google.dev/gemini-api/terms) before sending work content. Never submit sensitive, confidential, or personal information.

The live frontend is a Render static site and the API is a separate Render web service. `render.yaml` documents both. Production settings:

- Set a unique `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, exact `DJANGO_ALLOWED_HOSTS`, and exact `CORS_ALLOWED_ORIGINS` values.
- The static site applies a same-origin script/style policy, limits API connections to the configured backend, and denies framing.
- Set the frontend's public `VITE_API_URL` to the HTTPS origin of the deployed API. It is compiled into browser code and must never contain a secret. Production builds do not fall back to localhost.
- Set `CORS_ALLOWED_ORIGINS` on the API to the exact HTTPS origin of the live frontend.
- Serve over HTTPS. Set `SECURE_SSL_REDIRECT=true` only when the deployment is configured to serve HTTPS correctly. Enable HSTS after confirming the full domain and its subdomains use HTTPS.
- Use a paid Gemini API project for any service handling user content, and verify the terms and privacy requirements for the intended audience and region.
- Add user authentication, per-user quotas, billing controls, monitoring, and a privacy policy before public commercial use.
