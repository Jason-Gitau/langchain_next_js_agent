# 🦜️🔗 LangChain + Next.js Starter Template

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/langchain-ai/langchain-nextjs-template)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flangchain-ai%2Flangchain-nextjs-template)

This template scaffolds a LangChain.js + Next.js starter app. It showcases how to use and combine LangChain modules for several
use cases. Specifically:

- [Simple chat](/app/api/chat/route.ts)
- [Returning structured output from an LLM call](/app/api/chat/structured_output/route.ts)
- [Answering complex, multi-step questions with agents](/app/api/chat/agents/route.ts)
- [Retrieval augmented generation (RAG) with a chain and a vector store](/app/api/chat/retrieval/route.ts)
- [Retrieval augmented generation (RAG) with an agent and a vector store](/app/api/chat/retrieval_agents/route.ts)

Most of them use Vercel's [AI SDK](https://github.com/vercel-labs/ai) to stream tokens to the client and display the incoming messages.

The agents use [LangGraph.js](https://langchain-ai.github.io/langgraphjs/), LangChain's framework for building agentic workflows. They use preconfigured helper functions to minimize boilerplate, but you can replace them with custom graphs as desired.

https://github.com/user-attachments/assets/e389e4e4-4fb9-4223-a4c2-dc002c8f20d3

It's free-tier friendly too! Check out the [bundle size stats below](#-bundle-size).

You can check out a hosted version of this repo here: https://langchain-nextjs-template.vercel.app/

## 🚀 Getting Started

First, clone this repo and download it locally.

Next, you'll need to set up environment variables in your repo's `.env.local` file. Copy the `.env.example` file to `.env.local`.
To start with the basic examples, you'll just need to add your OpenAI API key.

Because this app is made to run in serverless Edge functions, make sure you've set the `LANGCHAIN_CALLBACKS_BACKGROUND` environment variable to `false` to ensure tracing finishes if you are using [LangSmith tracing](https://docs.smith.langchain.com/).

Next, install the required packages using your preferred package manager (e.g. `yarn`).

Now you're ready to run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result! Ask the bot something and you'll see a streamed response:

![A streaming conversation between the user and the AI](/public/images/chat-conversation.png)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Backend logic lives in `app/api/chat/route.ts`. From here, you can change the prompt and model, or add other modules and logic.

## � How to run this project locally (POC)

This repository ships a Next.js frontend and a backend scaffold under `backend/` that demonstrates how to run LangChain logic and stream events via Socket.IO + Redis. The frontend is intentionally a thin client that proxies heavy LLM work to the backend (or to an external LangChain service).

Prerequisites
- Node 20+ and npm or yarn
- Docker & Docker Compose (optional, but recommended for full-stack)

Quick start (frontend only - fast)
1. Install frontend deps and run dev server:

```bash
npm install
npm run dev
```

2. Open http://localhost:3000 and try the Agents page — if no backend is configured, a simulated streaming response will show so you can test the UI.

Full local stack (backend + worker + redis) using Docker Compose
1. Copy the example env and edit `.env`:

```bash
cp .env.example .env
# Edit .env and add any secrets you need (you can leave model keys empty to use POC simulation)
```

2. Start the stack:

```bash
docker compose up --build
```

3. Visit http://localhost:3000 (frontend) and the backend will be available at http://localhost:4000.

Running backend & worker locally (without Docker)
```bash
cd backend
npm install
npm run dev    # starts server (Express + Socket.IO)
npm run worker # in another terminal, starts worker that simulates agent runs
```

How the POC works
- `app/api/chat/agents` will proxy to an external backend if `BACKEND_URL` or `NEXT_PUBLIC_BACKEND_URL` is set. Otherwise it returns a simulated streaming response so you can test the UI without any model keys.
- To enable real LLM/embedding runs, point the frontend to your LangChain backend (Python or Node) and expose endpoints like `/chat/agents` and `/ingest`.

CI, Docker images and GitHub Actions
- A GitHub Actions workflow is added at `.github/workflows/ci.yml`. It builds the Next.js app on push and PR to `main`.
- If you want Actions to build and push Docker images, add these repository secrets to your GitHub project:
	- `DOCKERHUB_USERNAME`
	- `DOCKERHUB_TOKEN` (or use another registry token)

Secrets and security
- Keep LLM keys (Gemini/OpenAI), Supabase private keys, and DB credentials out of the frontend. Only place them in backend secrets. Locally, use `.env` (do not commit it).
- In production use your cloud provider's secret manager (GitHub secrets, AWS Secrets Manager, GCP Secret Manager, etc.).

Next steps you can ask me to do
- Port the ingest route to the backend using your preferred LLM/embedding provider.
- Wire the backend to an external Python LangChain service and proxy calls.
- Add GitHub Actions to build images and deploy to your platform of choice.

## �🧱 Structured Output

The second example shows how to have a model return output according to a specific schema using OpenAI Functions.
Click the `Structured Output` link in the navbar to try it out:

![A streaming conversation between the user and an AI agent](/public/images/structured-output-conversation.png)

The chain in this example uses a [popular library called Zod](https://zod.dev) to construct a schema, then formats it in the way OpenAI expects.
It then passes that schema as a function into OpenAI and passes a `function_call` parameter to force OpenAI to return arguments in the specified format.

For more details, [check out this documentation page](https://js.langchain.com/docs/how_to/structured_output).

## 🦜 Agents

To try out the agent example, you'll need to give the agent access to the internet by populating the `SERPAPI_API_KEY` in `.env.local`.
Head over to [the SERP API website](https://serpapi.com/) and get an API key if you don't already have one.

You can then click the `Agent` example and try asking it more complex questions:

![A streaming conversation between the user and an AI agent](/public/images/agent-conversation.png)

This example uses a [prebuilt LangGraph agent](https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/), but you can customize your own as well.

## 🐶 Retrieval

The retrieval examples both use Supabase as a vector store. However, you can swap in
[another supported vector store](https://js.langchain.com/docs/integrations/vectorstores) if preferred by changing
the code under `app/api/retrieval/ingest/route.ts`, `app/api/chat/retrieval/route.ts`, and `app/api/chat/retrieval_agents/route.ts`.

For Supabase, follow [these instructions](https://js.langchain.com/docs/integrations/vectorstores/supabase) to set up your
database, then get your database URL and private key and paste them into `.env.local`.

You can then switch to the `Retrieval` and `Retrieval Agent` examples. The default document text is pulled from the LangChain.js retrieval
use case docs, but you can change them to whatever text you'd like.

For a given text, you'll only need to press `Upload` once. Pressing it again will re-ingest the docs, resulting in duplicates.
You can clear your Supabase vector store by navigating to the console and running `DELETE FROM documents;`.

After splitting, embedding, and uploading some text, you're ready to ask questions!

For more info on retrieval chains, [see this page](https://js.langchain.com/docs/tutorials/rag).
The specific variant of the conversational retrieval chain used here is composed using LangChain Expression Language, which you can
[read more about here](https://js.langchain.com/docs/how_to/qa_sources/). This chain example will also return cited sources
via header in addition to the streaming response.

For more info on retrieval agents, [see this page](https://langchain-ai.github.io/langgraphjs/tutorials/rag/langgraph_agentic_rag/).

## 📦 Bundle size

The bundle size for LangChain itself is quite small. After compression and chunk splitting, for the RAG use case LangChain uses 37.32 KB of code space (as of [@langchain/core 0.1.15](https://npmjs.com/package/@langchain/core)), which is less than 4% of the total Vercel free tier edge function alottment of 1 MB:

![](/public/images/bundle-size.png)

This package has [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer) set up by default - you can explore the bundle size interactively by running:

```bash
$ ANALYZE=true yarn build
```

## 📚 Learn More

The example chains in the `app/api/chat/route.ts` and `app/api/chat/retrieval/route.ts` files use
[LangChain Expression Language](https://js.langchain.com/docs/concepts#langchain-expression-language) to
compose different LangChain.js modules together. You can integrate other retrievers, agents, preconfigured chains, and more too, though keep in mind
`HttpResponseOutputParser` is meant to be used directly with model output.

To learn more about what you can do with LangChain.js, check out the docs here:

- https://js.langchain.com/docs/

## ▲ Deploy on Vercel

When ready, you can deploy your app on the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Thank You!

Thanks for reading! If you have any questions or comments, reach out to us on Twitter
[@LangChainAI](https://twitter.com/langchainai), or [click here to join our Discord server](https://discord.gg/langchain).
