import { z } from "zod";
import { createLead, logEvent, getLeadByPhone } from "./db";

/**
 * Schema para validar dados recebidos do MagicAds
 */
export const MagicAdsLeadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  source: z.string().default("magicads"),
  campaignId: z.string().optional(),
  campaignName: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type MagicAdsLead = z.infer<typeof MagicAdsLeadSchema>;

/**
 * Processa um lead recebido do MagicAds
 */
export async function processMagicAdsLead(leadData: MagicAdsLead): Promise<{ success: boolean; leadId?: number; error?: string }> {
  try {
    // Validar dados
    const validatedData = MagicAdsLeadSchema.parse(leadData);

    // Criar lead no banco de dados
    await createLead({
      name: validatedData.name,
      email: validatedData.email || null,
      phone: validatedData.phone,
      status: "frio",
      stage: "novo",
      metadata: {
        source: validatedData.source,
        campaignId: validatedData.campaignId,
        campaignName: validatedData.campaignName,
        ...validatedData.metadata,
      },
    });

    // Buscar o lead criado
    const createdLead = await getLeadByPhone(validatedData.phone);
    const leadId = createdLead?.id || 0;

    // Registrar evento
    await logEvent({
      type: "lead_created",
      status: "success",
      phone: validatedData.phone,
      payload: {
        leadId,
        name: validatedData.name,
        campaignId: validatedData.campaignId,
        source: "magicads",
      },
    } as any);

    return {
      success: true,
      leadId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

    // Registrar erro
    await logEvent({
      type: "error",
      status: "error",
      payload: {
        error: errorMessage,
        data: leadData,
        source: "magicads",
      },
    } as any);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Valida a API Key do MagicAds
 */
export function validateMagicAdsApiKey(apiKey: string, storedApiKey: string): boolean {
  return apiKey === storedApiKey;
}

/**
 * Formata um lead do MagicFlow para enviar ao MagicAds
 */
export function formatLeadForMagicAds(lead: any) {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    stage: lead.stage,
    source: lead.source,
    createdAt: lead.createdAt,
    metadata: lead.metadata,
  };
}

/**
 * Sincroniza dados de follow-up para o MagicAds
 */
export async function syncFollowUpToMagicAds(
  leadId: number,
  followUpData: {
    status: string;
    stage: string;
    lastInteraction?: string;
    nextFollowUp?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Aqui você faria uma chamada HTTP para a API do MagicAds
    // Por enquanto, apenas registramos o evento
    await logEvent({
      type: "followup_sent",
      status: "success",
      payload: {
        leadId,
        ...followUpData,
        source: "magicads",
      },
    } as any);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro ao sincronizar";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
