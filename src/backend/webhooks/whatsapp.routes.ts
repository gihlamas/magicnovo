import { Router } from "express";
import { getDb, createEventLog } from "../../database/db";
import { sessions, leads } from "../../database/schema";
import { eq } from "drizzle-orm";

const webhookRouter = Router();
export default webhookRouter;

/**
 * Webhook para receber mensagens do WhatsApp Business API
 * GET /webhook - Verificação de webhook (handshake)
 * POST /webhook - Recebimento de mensagens
 */

webhookRouter.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "whatsapp_verify_token_123";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp] Webhook verified");
    res.status(200).send(challenge);
  } else {
    console.log("[WhatsApp] Webhook verification failed");
    res.sendStatus(403);
  }
});

webhookRouter.post("/webhook", async (req, res) => {
  const body = req.body;

  // Verificar estrutura da mensagem
  if (!body.object || body.object !== "whatsapp_business_account") {
    return res.sendStatus(404);
  }

  // Processar cada entrada
  if (body.entry && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      if (entry.changes && Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          if (change.field === "messages" && change.value) {
            await handleIncomingMessage(change.value);
          }
        }
      }
    }
  }

  // Responder imediatamente ao WhatsApp
  res.sendStatus(200);
});

interface WhatsAppMessage {
  messages?: Array<{
    from: string;
    id: string;
    timestamp: string;
    type: string;
    text?: {
      body: string;
    };
  }>;
  contacts?: Array<{
    profile: {
      name: string;
    };
    wa_id: string;
  }>;
}

async function handleIncomingMessage(value: WhatsAppMessage) {
  try {
    if (!value.messages || value.messages.length === 0) {
      return;
    }

    const message = value.messages[0];
    const contact = value.contacts?.[0];
    const phoneNumber = message.from;
    const messageText = message.text?.body || "";
    const contactName = contact?.profile?.name || "Unknown";

    console.log(`[WhatsApp] Received message from ${phoneNumber}: ${messageText}`);

    const db = await getDb();
    if (!db) {
      console.warn("[WhatsApp] Database not available");
      return;
    }

    // Buscar ou criar lead
    let lead = await db
      .select()
      .from(leads)
      .where(eq(leads.phone, phoneNumber))
      .limit(1);

    let leadId: number;
    if (lead.length === 0) {
      // Criar novo lead
      const result = await db.insert(leads).values({
        phone: phoneNumber,
        name: contactName,
        status: "frio",
        stage: "novo",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      leadId = (result as any).insertId || 1;

      await logEvent({
        type: "lead_created",
        status: "success",
        phone: phoneNumber,
        payload: { name: contactName },
      });
    } else {
      leadId = lead[0].id;
    }

    // Buscar ou criar sessão
    let session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.phone, phoneNumber))
      .limit(1);

    let sessionId: number;
    if (session.length === 0) {
      const result = await db.insert(sessions).values({
        phone: phoneNumber,
        messages: JSON.stringify([]),
        context: JSON.stringify({}),
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      sessionId = (result as any).insertId || 1;
    } else {
      sessionId = session[0].id;
    }

    // Processar mensagem com IA
    const conversationHistory = session.length > 0 
      ? JSON.parse(typeof session[0].messages === 'string' ? session[0].messages : JSON.stringify(session[0].messages))
      : [];

    conversationHistory.push({
      role: "user",
      content: messageText,
    });

    try {
      // Chamar OpenAI para gerar resposta
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um assistente de atendimento ao cliente profissional. 
            Responda de forma concisa e amigável. 
            Identifique a intenção do cliente e tente ajudar da melhor forma possível.`,
          },
          ...conversationHistory,
        ],
      });

      const aiResponse =
        response.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

      conversationHistory.push({
        role: "assistant",
        content: aiResponse,
      });

      // Atualizar sessão
      await db
        .update(sessions)
        .set({
          messages: conversationHistory as any,
          lastActivity: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, sessionId));

      // Registrar evento
      await logEvent({
        type: "ai_response",
        status: "success",
        phone: phoneNumber,
        payload: {
          userMessage: messageText,
          aiResponse,
        },
      });

      // Aqui você enviaria a resposta de volta via WhatsApp API
      // await sendWhatsAppMessage(phoneNumber, aiResponse);

      console.log(`[WhatsApp] AI response sent to ${phoneNumber}`);
    } catch (error) {
      console.error("[WhatsApp] AI processing error:", error);

      await logEvent({
        type: "error",
        status: "error",
        phone: phoneNumber,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        payload: { messageText },
      });
    }
  } catch (error) {
    console.error("[WhatsApp] Error handling message:", error);
  }
}

/**
 * Função auxiliar para enviar mensagens via WhatsApp API
 * (Implementar conforme sua integração com WhatsApp Business API)
 */
export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      console.warn("[WhatsApp] Missing credentials for sending messages");
      return;
    }

    const url = `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "text",
        text: {
          body: message,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    console.log(`[WhatsApp] Message sent to ${phoneNumber}`);
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
  }
}
