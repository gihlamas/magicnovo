import { z } from "zod";
import { initTRPC } from "@trpc/server";

const t = initTRPC.create();
const publicProcedure = t.procedure;
const router = t.router;

export const appRouter = router({
  health: publicProcedure.query(() => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  })),

  info: publicProcedure.query(() => ({
    name: "MagicFlow",
    version: "1.0.0",
    description: "Sistema Inteligente de Atendimento e Agendamento via WhatsApp com IA",
  })),

  // ============================================
  // LEADS ROUTER
  // ============================================
  leads: router({
    list: publicProcedure.query(async () => {
      return [
        {
          id: 1,
          phone: "5511999999999",
          name: "João Silva",
          email: "joao@example.com",
          status: "quente",
          stage: "qualificado",
          service: "Consultoria",
          lastInteraction: new Date(),
          followUpCount: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }),

    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return {
          id: input,
          phone: "5511999999999",
          name: "João Silva",
          email: "joao@example.com",
          status: "quente",
          stage: "qualificado",
          service: "Consultoria",
        };
      }),

    create: publicProcedure
      .input(
        z.object({
          phone: z.string(),
          name: z.string().optional(),
          service: z.string().optional(),
          status: z.enum(["quente", "morno", "frio"]).optional(),
          stage: z.enum(["novo", "qualificado", "agendado", "encerrado"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return { success: true, data: input };
      }),
  }),

  // ============================================
  // APPOINTMENTS ROUTER
  // ============================================
  appointments: router({
    list: publicProcedure.query(async () => {
      return [
        {
          id: 1,
          leadId: 1,
          title: "Consulta com João",
          scheduledAt: new Date(Date.now() + 86400000),
          status: "agendado",
          type: "consulta",
        },
      ];
    }),

    create: publicProcedure
      .input(
        z.object({
          leadId: z.number(),
          title: z.string(),
          scheduledAt: z.date(),
          status: z.enum(["confirmado", "cancelado", "realizado", "pendente"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return { success: true, data: input };
      }),
  }),

  // ============================================
  // INTEGRATIONS ROUTER
  // ============================================
  integrations: router({
    get: publicProcedure.query(async () => {
      return {
        whatsappToken: "***",
        whatsappPhoneId: "***",
        openaiApiKey: "***",
      };
    }),

    validate: publicProcedure
      .input(
        z.object({
          whatsappToken: z.string().optional(),
          whatsappPhoneId: z.string().optional(),
          openaiApiKey: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return {
          valid: true,
          message: "Validação simulada",
        };
      }),

    upsert: publicProcedure
      .input(
        z.object({
          whatsappToken: z.string().optional(),
          whatsappPhoneId: z.string().optional(),
          openaiApiKey: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return {
          success: true,
          message: "Integrações salvas com sucesso",
        };
      }),
  }),

  // ============================================
  // INTEGRATION TESTS ROUTER
  // ============================================
  integrationTests: router({
    testOpenAI: publicProcedure.query(async () => {
      return {
        success: true,
        service: "OpenAI",
        message: "Teste simulado com sucesso",
      };
    }),

    testWhatsApp: publicProcedure.query(async () => {
      return {
        success: true,
        service: "WhatsApp",
        message: "Teste simulado com sucesso",
      };
    }),

    runAll: publicProcedure.query(async () => {
      return {
        success: true,
        message: "Todos os testes foram executados",
        results: [
          { service: "OpenAI", success: true },
          { service: "WhatsApp", success: true },
        ],
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
