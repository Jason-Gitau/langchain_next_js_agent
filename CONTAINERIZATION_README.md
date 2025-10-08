Containerization guide for this repo

Overview
- This project is a Next.js app (app dir) that includes API routes under `app/api/*` and server-only code under `app/ai_sdk/*`.
- For a RAG chatbot, heavy operations (embedding ingestion, agent execution, vector DB access) should live in a separate backend service so they can be scaled independently and hold long-lived connections.

Which files to keep in Next.js (frontend)
- UI pages/components in `app/`, `components/` — keep here.
- Lightweight API routes that only forward small requests or handle session auth.

Which to extract to the backend service
- `app/api/retrieval/ingest/route.ts` — ingesting and embedding documents (Supabase or other vector store). Move to backend `/ingest`.
- Any long-running agent logic in `app/ai_sdk/agent/action.ts` and `app/ai_sdk/tools/action.ts` — move to backend `/agent/run`.
- Retrieval logic that requires persistent DB connections or heavy compute.

Files added for containerization
- `Dockerfile` — multi-stage Dockerfile to build and run Next.js.
- `backend/` — a scaffold Express app (Dockerfile and simple endpoints) for moving heavy routes.
- `docker-compose.yml` — local compose setup: `web` (Next.js), `backend`, and `vectordb` (Redis placeholder).
- `.dockerignore` — files omitted from images.

Environment wiring and secrets
- Use environment variables for secrets (OpenAI keys, Supabase keys, DB URLs).
- Locally with docker-compose: create a `.env` file with variables and add `env_file: .env` under service definitions if you prefer. Example keys:

  NEXT_PUBLIC_OPENAI_KEY=sk_...
  SUPABASE_URL=https://... 
  SUPABASE_PRIVATE_KEY=...

- Do NOT commit `.env` to git. Use your platform's secret manager in production (GCP Secret Manager, AWS Secrets Manager, or Vercel/Netlify envs).

How Next.js calls the backend
- Replace or refactor the Next.js API routes (e.g., `app/api/retrieval/ingest/route.ts`) to call the backend endpoints (e.g., fetch to `http://backend:4000/ingest` when running in compose or `https://api.example.com/ingest` in prod).

Running locally
1. Create `.env` with required variables (see above).
2. Build and start with compose:

```bash
docker compose up --build
```

3. The Next.js app will be at http://localhost:3000 and backend at http://localhost:4000.

CI / Production
- Build both images in CI. Push to a registry.
- Deploy frontend to Vercel (recommended for static/edge) or to your container platform. If you host the Next.js container, use Node server mode (`next start`).
- Deploy backend to Cloud Run / ECS / Kubernetes and configure autoscaling and secrets.

Next steps
- I can: create refactor patches for Next.js to proxy or call the backend endpoints and port logic from the identified files. Tell me if you want me to do that now.
