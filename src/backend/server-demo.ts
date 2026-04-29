import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./api/routers";
import whatsappRoutes from "./webhooks/whatsapp.routes";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // CORS para desenvolvimento
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Health check
  app.get("/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: "demo"
    });
  });

  // API info
  app.get("/api/info", (req, res) => {
    res.json({
      name: "MagicFlow",
      version: "1.0.0",
      description: "Sistema Inteligente de Atendimento e Agendamento via WhatsApp com IA",
      endpoints: {
        health: "/health",
        trpc: "/api/trpc",
        webhook: "/webhook"
      }
    });
  });

  // WhatsApp webhook
  app.use("/webhook", whatsappRoutes);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: async () => ({ userId: 1 }),
    })
  );

  const port = parseInt(process.env.PORT || "3000");
  server.listen(port, () => {
    console.log(`\n✅ MagicFlow Server iniciado com sucesso!\n`);
    console.log(`📊 API disponível em: http://localhost:${port}/api/trpc`);
    console.log(`🔔 Webhook disponível em: http://localhost:${port}/webhook`);
    console.log(`❤️  Health check em: http://localhost:${port}/health`);
    console.log(`ℹ️  Info em: http://localhost:${port}/api/info\n`);
  });
}

startServer().catch((error) => {
  console.error("❌ Erro ao iniciar servidor:", error);
  process.exit(1);
});
