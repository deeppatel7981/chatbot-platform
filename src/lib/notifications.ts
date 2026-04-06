import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

/**
 * Notify internal staff when a conversation needs human attention.
 * Uses SES when AWS_REGION + ALERT_EMAIL_FROM + ALERT_EMAIL_TO are set; otherwise logs only.
 */
export async function notifyHandoff(params: {
  organizationId: string;
  clientName: string;
  conversationId: string;
  summary: string;
}): Promise<void> {
  const from = process.env.ALERT_EMAIL_FROM;
  const to = process.env.ALERT_EMAIL_TO;
  const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;

  const subject = `[Handoff] ${params.clientName} — conversation ${params.conversationId}`;
  const body = `Organization: ${params.organizationId}\nClient: ${params.clientName}\nConversation: ${params.conversationId}\n\nSummary:\n${params.summary}`;

  if (!from || !to || !region) {
    console.info("[handoff notification]", subject, body);
    return;
  }

  const ses = new SESClient({ region });
  await ses.send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: body } },
      },
    })
  );
}
