"use server";

export async function executeTool(input: string, options?: { wso?: boolean; streamEvents?: boolean }) {
  "use server";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000';
  const r = await fetch(`${backendUrl}/agent/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, options }),
  });
  return r.json();
}
