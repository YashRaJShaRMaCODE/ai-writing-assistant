# Clear Writing frontend

The React + Vite client for the Clear Writing workspace. It lets a person draft, rewrite, summarise, review, copy, and download text. The full product, privacy, setup, and deployment guide is in the [repository README](../README.md).

## Run locally

```bash
npm ci
npm run dev
```

Set `VITE_API_URL` in `.env.local` to the backend origin when it is not running at `http://127.0.0.1:8000`. This is a public build-time URL, not a place for secrets.

## Checks

```bash
npm run lint
npm run build
```

The production site is built to `dist/`. Render publishes `frontend/dist` from the repository root.
