'use strict';

require('dotenv').config();

const config = {
  // Servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // WhatsApp Meta Cloud API
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v19.0',

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  OPENAI_MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,

  // Banco de dados (SQLite em memória por padrão para demonstração)
  DB_DIALECT: process.env.DB_DIALECT || 'sqlite',
  DB_STORAGE: process.env.DB_STORAGE || ':memory:',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT) || 5432,
  DB_NAME: process.env.DB_NAME || 'whatsapp_agent',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_SSL: process.env.DB_SSL === 'true',

  // Follow-up scheduler (em minutos)
  FOLLOWUP_DELAY_1: parseInt(process.env.FOLLOWUP_DELAY_1) || 10,
  FOLLOWUP_DELAY_2: parseInt(process.env.FOLLOWUP_DELAY_2) || 60,
  FOLLOWUP_DELAY_3: parseInt(process.env.FOLLOWUP_DELAY_3) || 1440,
  FOLLOWUP_MAX_ATTEMPTS: parseInt(process.env.FOLLOWUP_MAX_ATTEMPTS) || 3,

  // Segurança
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
};

// Validação de variáveis obrigatórias em produção
const requiredInProduction = [
  'WHATSAPP_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_VERIFY_TOKEN',
  'OPENAI_API_KEY',
];

if (config.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`);
  }
}

module.exports = config;
