'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const { connectDatabase } = require('./config/database');
const logger = require('./utils/logger');

const webhookRoutes = require('./routes/webhook.routes');
const apiRoutes = require('./routes/api.routes');
const { validateWebhookSignature } = require('./middlewares/webhookValidator.middleware');
const { apiKeyAuth } = require('./middlewares/auth.middleware');
const { errorHandler, notFound } = require('./middlewares/errorHandler.middleware');
const { startScheduler } = require('./services/scheduler.service');

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARES GLOBAIS
// ─────────────────────────────────────────────────────────────────────────────

// Segurança HTTP
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
);

// Rate limiting global
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em breve.' },
});
app.use(limiter);

// Rate limiting mais restrito para o webhook
const webhookLimiter = rateLimit({
  windowMs: 60000,
  max: 200,
  message: { error: 'Limite de requisições do webhook excedido.' },
});

// Parsing de JSON
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logs HTTP
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.path === '/api/health',
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// ROTAS
// ─────────────────────────────────────────────────────────────────────────────

// Webhook WhatsApp (com validação de assinatura)
app.use('/webhook', webhookLimiter, validateWebhookSignature, webhookRoutes);

// API interna (com autenticação por API key)
app.use('/api', apiKeyAuth, apiRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'MagicFlow API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health',
  });
});

// 404 e tratamento de erros
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

async function bootstrap() {
  try {
    // Conecta ao banco de dados
    await connectDatabase();

    // Inicia o servidor HTTP
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Servidor iniciado na porta ${config.PORT} [${config.NODE_ENV}]`);
      logger.info(`📲 Webhook disponível em: POST /webhook`);
      logger.info(`🔗 API interna disponível em: /api`);
    });

    // Inicia o scheduler de follow-up
    startScheduler();

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`Recebido ${signal}. Encerrando servidor...`);
      server.close(() => {
        logger.info('Servidor encerrado com sucesso.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Tratamento de erros não capturados
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

bootstrap();

module.exports = app;
