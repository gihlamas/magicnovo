# MagicFlow

**Painel administrativo inteligente para gestão de leads e agendamentos via WhatsApp com IA.**

MagicFlow é um sistema completo de atendimento que integra WhatsApp, OpenAI e MagicAds em uma única plataforma, permitindo automação inteligente de leads e agendamentos.

---

## 📋 Características

- **Gestão de Leads**: Organize e qualifique contatos com filtros avançados (frio, morno, quente)
- **Agendamentos Inteligentes**: Calendário interativo com sincronização automática
- **Integração WhatsApp**: Receba e responda mensagens via Meta Cloud API
- **IA Conversacional**: Agente de IA baseado em GPT-4 para atendimento automático
- **Integração MagicAds**: Sincronize leads automaticamente de suas campanhas
- **Log de Eventos**: Rastreamento completo de todas as interações
- **Catálogo de Produtos**: Gerencie seus produtos/serviços integrados ao agente

---

## 🏗️ Estrutura do Projeto

```
magicflow/
├── src/
│   ├── index.ts                 # Ponto de entrada principal
│   ├── frontend/                # Componentes React
│   │   ├── App.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Leads.tsx
│   │   ├── Appointments.tsx
│   │   ├── Integrations.tsx
│   │   └── ...
│   ├── backend/
│   │   ├── api/                 # Rotas tRPC
│   │   │   ├── routers.ts
│   │   │   └── magicads.ts
│   │   ├── services/            # Lógica de negócio
│   │   │   ├── openai.service.ts
│   │   │   ├── integration-tests.service.ts
│   │   │   ├── magicads-integration.ts
│   │   │   └── ...
│   │   └── webhooks/            # Webhooks do WhatsApp
│   │       ├── webhooks.ts
│   │       └── webhook.routes.js
│   └── database/                # Schema e migrações
│       ├── schema.ts
│       ├── db.ts
│       └── *.sql
├── config/                      # Arquivos de configuração
│   ├── env.js
│   ├── server.js
│   └── index.js
├── docs/                        # Documentação
│   ├── GUIA_TECNICO_MAGICADS.md
│   ├── GUIA_USUARIO_MAGICADS.md
│   └── ...
├── package.json
├── pnpm-lock.yaml
└── .env.example
```

---

## 🚀 Começando

### Pré-requisitos

- **Node.js** 18+ 
- **pnpm** 10+
- **PostgreSQL** ou **MySQL** (para produção)
- **Chaves de API**:
  - WhatsApp (Meta Cloud API)
  - OpenAI (GPT-4)
  - MagicAds (opcional)

### Instalação

1. **Clone ou extraia o projeto**:
```bash
cd /home/ubuntu/projeto
```

2. **Instale as dependências**:
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**:
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

4. **Execute as migrações do banco de dados**:
```bash
# Para PostgreSQL/MySQL, execute os arquivos SQL em src/database/
```

5. **Inicie o servidor de desenvolvimento**:
```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

---

## 📚 Documentação

- **[Guia Técnico de Integração MagicAds](./docs/GUIA_TECNICO_MAGICADS.md)** - Como configurar o webhook do MagicAds
- **[Guia do Usuário](./docs/GUIA_USUARIO_MAGICADS.md)** - Como usar o painel administrativo
- **[Guia de Deploy](./docs/DEPLOY.md)** - Como fazer deploy em uma VPS

---

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/magicflow
# ou para MySQL:
# DATABASE_URL=mysql://user:password@localhost:3306/magicflow

# WhatsApp (Meta Cloud API)
WHATSAPP_TOKEN=seu_token_aqui
WHATSAPP_PHONE_ID=seu_phone_id_aqui

# OpenAI
OPENAI_API_KEY=sk-...

# MagicAds
MAGICADS_API_KEY=sua_chave_aqui

# Servidor
PORT=3000
NODE_ENV=development
```

---

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia o servidor com hot-reload

# Produção
pnpm build            # Compila o projeto
pnpm start            # Inicia o servidor em produção

# Testes
pnpm test             # Executa os testes

# Utilitários
pnpm format           # Formata o código
pnpm check            # Verifica tipos TypeScript
```

---

## 🔗 Integrações

### WhatsApp (Meta Cloud API)

O sistema recebe mensagens via webhook e as processa automaticamente:

```
WhatsApp → Webhook → MagicFlow → OpenAI → Resposta
```

### OpenAI (GPT-4)

O agente de IA é treinado com um prompt customizável e exemplos de diálogo. Você pode:
- Personalizar o tom de voz (formal, neutro, informal)
- Adicionar exemplos de diálogo (few-shot learning)
- Integrar o catálogo de produtos

### MagicAds

Sincronize leads automaticamente:

```
MagicAds → Webhook → MagicFlow → Lead criado
```

---

## 📊 Fluxo de Dados

```
┌─────────────┐
│  MagicAds   │ ──→ Webhook recebe leads
└─────────────┘
       ↓
┌─────────────────────────────────────┐
│  MagicFlow - Banco de Dados Local   │
│  - Leads                            │
│  - Agendamentos                     │
│  - Configurações do Agente          │
└─────────────────────────────────────┘
       ↓
┌──────────────┐    ┌──────────────┐
│  WhatsApp    │←→  │   OpenAI     │
│ (Mensagens)  │    │   (IA)       │
└──────────────┘    └──────────────┘
```

---

## 🛠️ Deploy em VPS

Consulte o [Guia de Deploy](./docs/DEPLOY.md) para instruções detalhadas sobre como fazer deploy em uma VPS (Ubuntu/Debian).

---

## 📝 Licença

MIT

---

## 👥 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com o time de desenvolvimento.

---

**Versão**: 1.0.0  
**Última atualização**: Abril de 2026
