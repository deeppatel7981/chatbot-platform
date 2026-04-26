/**
 * One-line JSON logs for grep-friendly tracing (e.g. Datadog / Vercel log drains).
 * Pass the same `correlationId` from widget / WhatsApp entry through RAG and outbound send.
 */
export function logStructured(event: string, fields: Record<string, unknown>): void {
  const line = JSON.stringify({ t: new Date().toISOString(), event, ...fields });
  console.log(line);
}

export function newCorrelationId(): string {
  return crypto.randomUUID();
}
