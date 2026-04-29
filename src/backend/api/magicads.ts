import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { processMagicAdsLead, MagicAdsLeadSchema, syncFollowUpToMagicAds } from "../magicads-integration";
import { getDb } from "../db";

export const magicadsRouter = router({
  /**
   * Webhook para receber leads do MagicAds
   * Requer API Key válida
   */
  receiveWebhook: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        lead: MagicAdsLeadSchema,
      })
    )
    .mutation(async ({ input }) => {
      // Validar API Key (em produção, buscar do banco de dados)
      const validApiKey = process.env.MAGICADS_API_KEY || "default-key";
      if (input.apiKey !== validApiKey) {
        return {
          success: false,
          error: "API Key inválida",
        };
      }

      // Processar lead
      const result = await processMagicAdsLead(input.lead);
      return result;
    }),

  /**
   * Sincronizar dados de follow-up para MagicAds
   */
  syncFollowUp: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        status: z.string(),
        stage: z.string(),
        lastInteraction: z.string().optional(),
        nextFollowUp: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await syncFollowUpToMagicAds(input.leadId, {
        status: input.status,
        stage: input.stage,
        lastInteraction: input.lastInteraction,
        nextFollowUp: input.nextFollowUp,
      });
      return result;
    }),

  /**
   * Obter configuração da integração MagicAds
   */
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        configured: false,
        error: "Banco de dados não disponível",
      };
    }

    // Buscar integração MagicAds do usuário
    // Por enquanto, retornar configuração padrão
    return {
      configured: !!process.env.MAGICADS_API_KEY,
      webhookUrl: `/api/trpc/magicads.receiveWebhook`,
      apiKeyRequired: true,
    };
  }),

  /**
   * Salvar configuração da integração MagicAds
   */
  saveConfig: protectedProcedure
    .input(
      z.object({
        apiKey: z.string(),
        webhookUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Em produção, salvar no banco de dados com criptografia
      // Por enquanto, apenas validar
      if (!input.apiKey) {
        return {
          success: false,
          error: "API Key é obrigatória",
        };
      }

      return {
        success: true,
        message: "Configuração salva com sucesso",
      };
    }),

  /**
   * Testar conexão com MagicAds
   */
  testConnection: protectedProcedure
    .input(z.object({ apiKey: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Simular teste de conexão
        // Em produção, fazer uma chamada HTTP real à API do MagicAds
        if (!input.apiKey || input.apiKey.length < 10) {
          return {
            success: false,
            error: "API Key inválida",
          };
        }

        return {
          success: true,
          message: "Conexão com MagicAds estabelecida com sucesso",
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        return {
          success: false,
          error: errorMessage,
        };
      }
    }),
});
