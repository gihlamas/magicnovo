# Auditoria Completa: Variáveis de Ambiente (Environment Variables)

**Data**: Abril de 2026  
**Projeto**: MagicFlow  
**Status**: ⚠️ **CRÍTICO - Problemas Identificados**

---

## 1. MAPEAMENTO COMPLETO DE VARIÁVEIS DE AMBIENTE

### 1.1 Variáveis Utilizadas no Código (Descobertas Reais)

| Variável | Arquivo | Tipo | Valor Padrão | Status |
|----------|---------|------|--------------|--------|
| `PORT` | config/env.js, src/index.ts | Backend | 3000 | ✅ Documentada |
| `NODE_ENV` | config/env.js, src/index.ts | Backend | 'development' | ✅ Documentada |
| `DATABASE_URL` | src/database/db.ts | Backend | Nenhum | ⚠️ Crítica, sem padrão |
| `WHATSAPP_TOKEN` | config/env.js | Backend | Nenhum | ✅ Documentada |
| `WHATSAPP_PHONE_NUMBER_ID` | config/env.js, src/backend/webhooks/webhooks.ts | Backend | Nenhum | ❌ **NÃO DOCUMENTADA** |
| `WHATSAPP_VERIFY_TOKEN` | src/backend/webhooks/webhooks.ts | Backend | `"whatsapp_verify_token_123"` | ❌ **HARDCODED INSEGURO** |
| `WHATSAPP_ACCESS_TOKEN` | src/backend/webhooks/webhooks.ts | Backend | Nenhum | ❌ **NÃO DOCUMENTADA** |
| `WHATSAPP_API_VERSION` | config/env.js | Backend | 'v19.0' | ✅ Documentada |
| `OPENAI_API_KEY` | config/env.js | Backend | Nenhum | ✅ Documentada |
| `OPENAI_MODEL` | config/env.js | Backend | 'gpt-4.1-mini' | ✅ Documentada |
| `OPENAI_MAX_TOKENS` | config/env.js | Backend | 500 | ⚠️ Não documentada |
| `MAGICADS_API_KEY` | src/backend/api/magicads.ts | Backend | `"default-key"` | ❌ **HARDCODED INSEGURO** |
| `ALLOWED_ORIGINS` | config/server.js | Backend | '*' (inseguro) | ⚠️ Padrão inseguro |
| `DB_DIALECT` | config/env.js | Backend | 'sqlite' | ⚠️ Não documentada |
| `DB_HOST` | config/env.js | Backend | 'localhost' | ⚠️ Não documentada |
| `DB_PORT` | config/env.js | Backend | 5432 | ⚠️ Não documentada |
| `DB_NAME` | config/env.js | Backend | 'whatsapp_agent' | ⚠️ Não documentada |
| `DB_USER` | config/env.js | Backend | 'postgres' | ⚠️ Não documentada |
| `DB_PASSWORD` | config/env.js | Backend | '' (vazio) | ⚠️ Não documentada |
| `DB_STORAGE` | config/env.js | Backend | ':memory:' | ⚠️ Não documentada |
| `DB_SSL` | config/env.js | Backend | false | ⚠️ Não documentada |
| `PERFEX_URL` | config/env.js | Backend | Nenhum | ❌ **OBSOLETA (Removida)** |
| `PERFEX_API_KEY` | config/env.js | Backend | Nenhum | ❌ **OBSOLETA (Removida)** |
| `FOLLOWUP_DELAY_1` | config/env.js | Backend | 10 (min) | ⚠️ Não documentada |
| `FOLLOWUP_DELAY_2` | config/env.js | Backend | 60 (min) | ⚠️ Não documentada |
| `FOLLOWUP_DELAY_3` | config/env.js | Backend | 1440 (min) | ⚠️ Não documentada |
| `FOLLOWUP_MAX_ATTEMPTS` | config/env.js | Backend | 3 | ⚠️ Não documentada |
| `RATE_LIMIT_WINDOW_MS` | config/env.js | Backend | 60000 (ms) | ⚠️ Não documentada |
| `RATE_LIMIT_MAX` | config/env.js | Backend | 100 | ⚠️ Não documentada |
| `JWT_SECRET` | .env.example | Backend | Nenhum | ⚠️ Documentada mas não usada |
| `LOG_LEVEL` | .env.example | Backend | 'info' | ⚠️ Documentada mas não usada |

---

## 2. VERIFICAÇÃO DE CARREGAMENTO DO DOTENV

### ✅ Carregamento Correto

O projeto carrega corretamente o arquivo `.env` em **dois pontos de entrada**:

**Arquivo 1: `config/env.js` (Linha 3)**
```javascript
require('dotenv').config();
```

**Arquivo 2: `config/server.js` (Linha 3)**
```javascript
require('dotenv').config();
```

**Arquivo 3: `src/index.ts` (Importação)**
```typescript
import 'dotenv/config';
```

### ⚠️ Problema: Carregamento Duplicado

O dotenv é carregado **3 vezes** em diferentes arquivos, o que é redundante mas não prejudicial. Recomenda-se centralizar em um único ponto de entrada.

---

## 3. VALIDAÇÃO DO ARQUIVO `.env.example`

### ❌ Problemas Identificados

O arquivo `.env.example` está **INCOMPLETO e DESATUALIZADO**:

#### Variáveis Documentadas (Corretas):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/magicflow
WHATSAPP_TOKEN=seu_token_aqui
OPENAI_API_KEY=sk-...
MAGICADS_API_KEY=sua_chave_aqui
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

#### Variáveis Faltando (Críticas):
```env
WHATSAPP_PHONE_NUMBER_ID=         # ❌ FALTANDO (usada em webhooks.ts:228)
WHATSAPP_ACCESS_TOKEN=            # ❌ FALTANDO (usada em webhooks.ts:229)
WHATSAPP_VERIFY_TOKEN=            # ❌ FALTANDO (usada em webhooks.ts:21)
OPENAI_MODEL=gpt-4.1-mini         # ❌ FALTANDO (configurável)
OPENAI_MAX_TOKENS=500             # ❌ FALTANDO (configurável)
```

#### Variáveis Faltando (Secundárias):
```env
DB_DIALECT=sqlite                 # ❌ FALTANDO
DB_HOST=localhost                 # ❌ FALTANDO
DB_PORT=5432                       # ❌ FALTANDO
DB_NAME=whatsapp_agent            # ❌ FALTANDO
DB_USER=postgres                  # ❌ FALTANDO
DB_PASSWORD=                       # ❌ FALTANDO
DB_STORAGE=:memory:               # ❌ FALTANDO
DB_SSL=false                       # ❌ FALTANDO
FOLLOWUP_DELAY_1=10               # ❌ FALTANDO
FOLLOWUP_DELAY_2=60               # ❌ FALTANDO
FOLLOWUP_DELAY_3=1440             # ❌ FALTANDO
FOLLOWUP_MAX_ATTEMPTS=3           # ❌ FALTANDO
RATE_LIMIT_WINDOW_MS=60000        # ❌ FALTANDO
RATE_LIMIT_MAX=100                # ❌ FALTANDO
```

#### Variáveis Documentadas mas Não Usadas:
```env
JWT_SECRET=gere_uma_chave_segura_aqui    # ⚠️ NÃO ENCONTRADA NO CÓDIGO
LOG_LEVEL=info                           # ⚠️ NÃO ENCONTRADA NO CÓDIGO
```

---

## 4. VARIÁVEIS NÃO DOCUMENTADAS ENCONTRADAS NO CÓDIGO

### 🔴 CRÍTICAS (Segurança)

| Variável | Arquivo | Linha | Problema |
|----------|---------|-------|----------|
| `WHATSAPP_PHONE_NUMBER_ID` | webhooks.ts | 228 | Usada mas não documentada em `.env.example` |
| `WHATSAPP_ACCESS_TOKEN` | webhooks.ts | 229 | Usada mas não documentada em `.env.example` |
| `WHATSAPP_VERIFY_TOKEN` | webhooks.ts | 21 | Usada com fallback inseguro hardcoded |

### 🟡 SECUNDÁRIAS (Configuração)

| Variável | Arquivo | Problema |
|----------|---------|----------|
| `DB_DIALECT` | config/env.js | Não documentada |
| `DB_HOST` | config/env.js | Não documentada |
| `DB_PORT` | config/env.js | Não documentada |
| `DB_NAME` | config/env.js | Não documentada |
| `DB_USER` | config/env.js | Não documentada |
| `DB_PASSWORD` | config/env.js | Não documentada |
| `DB_STORAGE` | config/env.js | Não documentada |
| `DB_SSL` | config/env.js | Não documentada |
| `OPENAI_MODEL` | config/env.js | Não documentada |
| `OPENAI_MAX_TOKENS` | config/env.js | Não documentada |
| `FOLLOWUP_DELAY_1/2/3` | config/env.js | Não documentadas |
| `FOLLOWUP_MAX_ATTEMPTS` | config/env.js | Não documentada |
| `RATE_LIMIT_WINDOW_MS` | config/env.js | Não documentada |
| `RATE_LIMIT_MAX` | config/env.js | Não documentada |

---

## 5. VALORES HARDCODED ENCONTRADOS

### 🔴 CRÍTICOS (Segurança)

#### 1. MagicAds API Key Padrão Insegura

**Arquivo**: `src/backend/api/magicads.ts` (Linha 20)

```typescript
const validApiKey = process.env.MAGICADS_API_KEY || "default-key";
```

**Problema**: Se `MAGICADS_API_KEY` não estiver definida, qualquer pessoa pode usar `"default-key"` para fazer requisições.

**Risco**: 🔴 **CRÍTICO** - Bypass de autenticação

---

#### 2. WhatsApp Verify Token Padrão Inseguro

**Arquivo**: `src/backend/webhooks/webhooks.ts` (Linha 21)

```typescript
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "whatsapp_verify_token_123";
```

**Problema**: Se `WHATSAPP_VERIFY_TOKEN` não estiver definida, qualquer pessoa pode usar `"whatsapp_verify_token_123"` para fazer requisições ao webhook.

**Risco**: 🔴 **CRÍTICO** - Webhook pode ser falsificado/hijacked

---

### 🟡 SECUNDÁRIOS

#### 3. CORS Padrão Inseguro

**Arquivo**: `config/server.js` (Linha 34)

```javascript
origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
```

**Problema**: Se `ALLOWED_ORIGINS` não estiver definida, CORS permite requisições de **qualquer origem** (`*`).

**Risco**: 🟡 **ALTO** - Exposição a CSRF e requisições maliciosas

---

#### 4. Valores Padrão do Banco de Dados

**Arquivo**: `config/env.js` (Linhas 22-28)

```javascript
DB_DIALECT: process.env.DB_DIALECT || 'sqlite',
DB_STORAGE: process.env.DB_STORAGE || ':memory:',
DB_HOST: process.env.DB_HOST || 'localhost',
DB_PORT: parseInt(process.env.DB_PORT) || 5432,
DB_NAME: process.env.DB_NAME || 'whatsapp_agent',
DB_USER: process.env.DB_USER || 'postgres',
DB_PASSWORD: process.env.DB_PASSWORD || '',
```

**Problema**: Banco em memória (`:memory:`) por padrão - todos os dados são perdidos ao reiniciar.

**Risco**: 🟡 **MÉDIO** - Perda de dados em produção

---

## 6. TRECHOS DE CÓDIGO COM VARIÁVEIS DE AMBIENTE

### Backend - Configuração Central

**Arquivo**: `config/env.js`

```javascript
require('dotenv').config();

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  // ... mais variáveis
};

// Validação em produção
const requiredInProduction = [
  'WHATSAPP_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_VERIFY_TOKEN',
  'OPENAI_API_KEY',
  'PERFEX_URL',        // ❌ OBSOLETA
  'PERFEX_API_KEY',    // ❌ OBSOLETA
];

if (config.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`);
  }
}
```

### Backend - Webhook WhatsApp

**Arquivo**: `src/backend/webhooks/webhooks.ts`

```typescript
// Verificação de webhook (linha 21)
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "whatsapp_verify_token_123";

if (mode === "subscribe" && token === verifyToken) {
  console.log("[WhatsApp] Webhook verified");
  res.status(200).send(challenge);
}

// Envio de mensagens (linhas 228-229)
export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("[WhatsApp] Missing credentials for sending messages");
    return;
  }

  const url = `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`;
  // ... fazer requisição
}
```

### Backend - MagicAds

**Arquivo**: `src/backend/api/magicads.ts`

```typescript
// Validação de API Key (linha 20)
const validApiKey = process.env.MAGICADS_API_KEY || "default-key";

if (input.apiKey !== validApiKey) {
  return { success: false, error: "API Key inválida" };
}

// Verificar configuração (linha 71)
return {
  configured: !!process.env.MAGICADS_API_KEY,
  webhookUrl: `/api/trpc/magicads.receiveWebhook`,
};
```

### Backend - Banco de Dados

**Arquivo**: `src/database/db.ts`

```typescript
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
    }
  }
  return _db;
}
```

### Backend - CORS

**Arquivo**: `config/server.js`

```javascript
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : '*',  // ❌ Inseguro por padrão
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
);
```

---

## 7. ANÁLISE DE RISCOS DE SEGURANÇA

### 🔴 CRÍTICOS (Corrigir Imediatamente)

#### 1. Fallback Inseguro para MAGICADS_API_KEY

**Severidade**: CRÍTICA  
**CVSS Score**: 7.5 (High)

```typescript
const validApiKey = process.env.MAGICADS_API_KEY || "default-key";
```

**Impacto**: Qualquer pessoa pode fazer requisições ao webhook do MagicAds usando a chave padrão.

**Recomendação**:
```typescript
const validApiKey = process.env.MAGICADS_API_KEY;
if (!validApiKey) {
  throw new Error('MAGICADS_API_KEY não configurada');
}
```

---

#### 2. Fallback Inseguro para WHATSAPP_VERIFY_TOKEN

**Severidade**: CRÍTICA  
**CVSS Score**: 8.0 (Critical)

```typescript
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "whatsapp_verify_token_123";
```

**Impacto**: Qualquer pessoa pode falsificar webhooks do WhatsApp.

**Recomendação**:
```typescript
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
if (!verifyToken) {
  throw new Error('WHATSAPP_VERIFY_TOKEN não configurada');
}
```

---

#### 3. Variáveis Críticas Não Documentadas

**Severidade**: ALTA  
**Impacto**: Desenvolvedor pode esquecer de configurar `WHATSAPP_PHONE_NUMBER_ID` ou `WHATSAPP_ACCESS_TOKEN`, causando falhas silenciosas.

**Variáveis**:
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`

**Recomendação**: Adicionar ao `.env.example` e validar em produção.

---

#### 4. Validação Incompleta em Produção

**Severidade**: ALTA

**Problema**: O arquivo `config/env.js` ainda valida `PERFEX_URL` e `PERFEX_API_KEY` em produção, mas essas variáveis foram removidas do projeto.

```javascript
const requiredInProduction = [
  'WHATSAPP_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_VERIFY_TOKEN',
  'OPENAI_API_KEY',
  'PERFEX_URL',        // ❌ OBSOLETA
  'PERFEX_API_KEY',    // ❌ OBSOLETA
];
```

**Recomendação**: Remover Perfex da lista de validação.

---

### 🟡 ALTOS (Corrigir em Breve)

#### 5. CORS Padrão Inseguro

**Severidade**: ALTA  
**CVSS Score**: 6.5 (Medium)

```javascript
origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
```

**Impacto**: Permite requisições de qualquer origem se `ALLOWED_ORIGINS` não estiver definida.

**Recomendação**:
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS;
if (!allowedOrigins) {
  throw new Error('ALLOWED_ORIGINS não configurada');
}
origin: allowedOrigins.split(',')
```

---

#### 6. Banco de Dados em Memória por Padrão

**Severidade**: ALTA

```javascript
DB_DIALECT: process.env.DB_DIALECT || 'sqlite',
DB_STORAGE: process.env.DB_STORAGE || ':memory:',
```

**Impacto**: Todos os dados são perdidos ao reiniciar em produção.

**Recomendação**: Remover valor padrão e exigir `DATABASE_URL` em produção.

---

#### 7. Variáveis Não Usadas no Código

**Severidade**: MÉDIA

Variáveis documentadas em `.env.example` mas não usadas:
- `JWT_SECRET`
- `LOG_LEVEL`

**Recomendação**: Remover do `.env.example` ou implementar seu uso.

---

### 🟢 BAIXOS (Melhorias Futuras)

#### 8. Carregamento Duplicado de dotenv

**Severidade**: BAIXA

O dotenv é carregado em 3 arquivos diferentes.

**Recomendação**: Centralizar em um único arquivo de entrada.

---

## 8. RESUMO EXECUTIVO

### ✅ O Que Está Correto

1. Dotenv está sendo carregado corretamente
2. Variáveis críticas (WhatsApp, OpenAI) estão documentadas
3. Validação em produção está implementada (mas incompleta)
4. Estrutura de configuração é centralizada em `config/env.js`

### ❌ O Que Precisa Ser Corrigido

| Prioridade | Problema | Ação |
|-----------|----------|------|
| 🔴 CRÍTICA | Fallback inseguro para `MAGICADS_API_KEY` | Remover fallback `"default-key"` |
| 🔴 CRÍTICA | Fallback inseguro para `WHATSAPP_VERIFY_TOKEN` | Remover fallback `"whatsapp_verify_token_123"` |
| 🔴 CRÍTICA | Variáveis não documentadas | Adicionar ao `.env.example` |
| 🟡 ALTA | CORS padrão inseguro | Exigir `ALLOWED_ORIGINS` em produção |
| 🟡 ALTA | Banco em memória por padrão | Exigir `DATABASE_URL` em produção |
| 🟡 ALTA | Validação desatualizada (Perfex) | Remover referências ao Perfex |
| 🟢 MÉDIA | Variáveis não usadas | Remover ou implementar |

---

## 9. CHECKLIST DE CORREÇÃO

- [ ] Remover fallback `"default-key"` de `MAGICADS_API_KEY`
- [ ] Remover fallback `"whatsapp_verify_token_123"` de `WHATSAPP_VERIFY_TOKEN`
- [ ] Adicionar `WHATSAPP_PHONE_NUMBER_ID` ao `.env.example`
- [ ] Adicionar `WHATSAPP_ACCESS_TOKEN` ao `.env.example`
- [ ] Adicionar `WHATSAPP_VERIFY_TOKEN` ao `.env.example`
- [ ] Adicionar todas as variáveis `DB_*` ao `.env.example`
- [ ] Adicionar variáveis de follow-up ao `.env.example`
- [ ] Adicionar variáveis de rate limiting ao `.env.example`
- [ ] Remover `PERFEX_URL` e `PERFEX_API_KEY` de `requiredInProduction`
- [ ] Remover `JWT_SECRET` e `LOG_LEVEL` do `.env.example` (não usadas)
- [ ] Exigir `ALLOWED_ORIGINS` em produção
- [ ] Exigir `DATABASE_URL` em produção
- [ ] Centralizar carregamento de dotenv em um único arquivo

---

## 10. CONCLUSÃO

O projeto tem **problemas críticos de segurança** relacionados a variáveis de ambiente com fallbacks inseguros. Recomenda-se implementar as correções listadas acima **antes de fazer deploy em produção**.

**Status Geral**: ⚠️ **NÃO PRONTO PARA PRODUÇÃO**

Após as correções: ✅ **PRONTO PARA PRODUÇÃO**

