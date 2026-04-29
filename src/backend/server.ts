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

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
    console.log(`✅ Server running on http://localhost:${port}/`);
    console.log(`📊 API available at http://localhost:${port}/api/trpc`);
    console.log(`🔔 Webhook available at http://localhost:${port}/webhook`);
  });
}

startServer().catch((error) => {
  console.error("❌ Server failed to start:", error);
  process.exit(1);
});
