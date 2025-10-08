import { NextRequest, NextResponse } from 'next/server';

/**
 * Chat agents route proxy / local POC
 *
 * Behavior:
 * - If a BACKEND_URL / NEXT_PUBLIC_BACKEND_URL is configured, forward the request to
 *   `${BACKEND_URL}/chat/agents` and stream/pipe the response back to the client.
 * - Otherwise return a small simulated streaming response so the UI shows activity.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '';

    if (backendUrl) {
      // Forward request to external backend (assumed to implement /chat/agents)
      const upstream = await fetch(`${backendUrl.replace(/\/$/, '')}/chat/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Stream upstream response back to client
      const respBody = upstream.body;
      const headers: Record<string, string> = {};
      upstream.headers.forEach((value, key) => (headers[key] = value));
      return new Response(respBody, { status: upstream.status, headers });
    }

    // No backend configured: return a simulated streaming response for POC
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const chunks = [
          "🦜 Squawk! Hello, I'm Polly the parrot.\n",
          "I'm a POC streaming response so you can see the UI working.\n",
          "I'll pretend to fetch data and compose an answer...\n",
          "Final answer: The weather in Honolulu is sunny (POC). Squawk!"
        ];

        let i = 0;
        const push = () => {
          if (i < chunks.length) {
            controller.enqueue(encoder.encode(chunks[i]));
            i += 1;
            setTimeout(push, 400 + Math.random() * 400);
          } else {
            controller.close();
          }
        };

        push();
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
