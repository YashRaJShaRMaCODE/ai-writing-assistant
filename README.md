# Clear Writing

A small writing workspace for professional drafts. It can rewrite a passage while keeping its meaning or summarise it in a few sentences. Text is processed by Google Gemini and is not stored by this application.

## Data and usage notice

This prototype is for adults (18+) and professional use. Text submitted to the app is sent to Google Gemini. Avoid sensitive, confidential, or personal information. Google’s data-use terms differ between unpaid and paid API usage; unpaid service content may be used to improve Google products and may be reviewed by people. Read the [Gemini API terms](https://ai.google.dev/gemini-api/terms) before handling user content.

The app has no accounts, user-level quotas, or billing controls yet. Its anonymous API limit is a basic abuse guard, not a commercial billing system. Add account-level controls and review provider terms, privacy requirements, and deployment security before offering this as a public paid product.

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

The API is available at `http://127.0.0.1:8000/api/rewrite/`. It accepts JSON with a `text` field (up to 5,000 characters) and `mode` set to `rewrite` or `summarise`. Requests are limited to 10 per hour per anonymous IP. The Gemini key stays on the backend and is sent in the `x-goog-api-key` header.

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

## Production notes

- Set a unique `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, exact `DJANGO_ALLOWED_HOSTS`, and exact `CORS_ALLOWED_ORIGINS` values.
- Serve over HTTPS. Set `SECURE_SSL_REDIRECT=true` only when the deployment is configured to serve HTTPS correctly. Enable HSTS after confirming the full domain and its subdomains use HTTPS.
- Use a paid Gemini API project for any service handling user content, and verify the terms and privacy requirements for the intended audience and region.
- Add user authentication, per-user quotas, billing controls, monitoring, and a privacy policy before public commercial use.
