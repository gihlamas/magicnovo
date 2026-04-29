# MagicFlow

Um painel administrativo elegante e sofisticado para gerenciar leads, agendamentos e personalizar um agente de IA integrado com WhatsApp e OpenAI.

## 🎯 Funcionalidades Principais

### Dashboard
- **Métricas em Tempo Real**: Total de leads, distribuição por status (quente/morno/frio)
- **Gráficos Interativos**: Visualização de agendamentos da semana e distribuição de leads
- **Widgets**: Últimos leads capturados e próximos agendamentos
- **Taxa de Conversão**: Monitoramento do funil de vendas

### Gestão de Leads
- **Listagem Completa**: Tabela com todos os leads capturados
- **Filtros Avançados**: Por status (quente/morno/frio) e estágio (novo/qualificado/agendado/encerrado)
- **Busca Rápida**: Por nome ou telefone
- **Edição Inline**: Atualizar dados do lead sem sair da listagem
- **Página de Detalhes**: Visualizar histórico completo de eventos e interações

### Gestão de Agendamentos
- **Calendário Interativo**: Filtrar agendamentos por data
- **Listagem Organizada**: Agendamentos agrupados por data
- **Gerenciamento de Status**: Confirmar, cancelado ou marcar como realizado
- **Notas e Detalhes**: Adicionar observações aos agendamentos

### Personalização do Agente de IA
- **Editor de Prompt**: Customizar o comportamento do agente
- **Seletor de Tom de Voz**: Formal, neutro ou informal
- **Few-Shot Prompting**: Adicionar exemplos de diálogos para melhorar respostas
- **Preview em Tempo Real**: Visualizar como o agente responderá

### Configurações de Integração
- **Meta/WhatsApp**: Token de acesso, ID do número e token de verificação
- **OpenAI**: Chave de API para usar GPT como agente
- **Status de Conexão**: Indicador visual de quais integrações estão configuradas

### Log de Eventos
- **Histórico Completo**: Todos os eventos por lead (recebimento, análise, classificação, agendamento)
- **Detalhes Expandíveis**: Visualizar payload completo de cada evento
- **Timestamps**: Data e hora precisas de cada ação

## 🏗️ Arquitetura

### Backend (Node.js + Express + tRPC)
```
server/
├── routers.ts          # Procedures tRPC para leads, agendamentos, config, integrações
├── db.ts               # Query helpers e operações de banco
├── leads.test.ts       # Testes unitários dos procedures
└── _core/              # Framework plumbing (auth, context, etc)
```

### Frontend (React + TypeScript + Tailwind)
```
client/src/
├── pages/
│   ├── Home.tsx              # Dashboard com métricas e gráficos
│   ├── Leads.tsx             # Listagem de leads com filtros
│   ├── LeadDetail.tsx        # Detalhes do lead e histórico
│   ├── Appointments.tsx      # Gestão de agendamentos
│   ├── Agent.tsx             # Editor de personalização da IA
│   └── Integrations.tsx      # Configurações de integrações
├── components/
│   └── DashboardLayout.tsx   # Layout principal com sidebar
└── lib/
    └── trpc.ts               # Cliente tRPC
```

### Banco de Dados (MySQL/TiDB)
```sql
-- Tabelas principais
users              -- Usuários autenticados
leads              -- Contatos capturados
appointments       -- Agendamentos
agent_configs      -- Configurações do agente de IA
integrations       -- Credenciais das integrações
event_logs         -- Histórico de eventos
```

## 🚀 Como Começar

### Pré-requisitos
- Node.js 22+
- pnpm 10+
- Credenciais de integração (Meta, OpenAI)

### Instalação

1. **Clonar o repositório**
```bash
git clone <seu-repo>
cd magicflow
```

2. **Instalar dependências**
```bash
pnpm install
```

3. **Configurar variáveis de ambiente**
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Preencher com suas credenciais
# DATABASE_URL, JWT_SECRET, etc.
```

4. **Executar migrações do banco**
```bash
pnpm db:push
```

5. **Iniciar servidor de desenvolvimento**
```bash
pnpm dev
```

O painel estará disponível em `http://localhost:3000`

## 📋 Procedures tRPC Disponíveis

### Leads
- `leads.list()` - Listar todos os leads do usuário
- `leads.getById(id)` - Obter detalhes de um lead
- `leads.create(data)` - Criar novo lead
- `leads.update(id, data)` - Atualizar lead

### Appointments
- `appointments.list()` - Listar todos os agendamentos
- `appointments.getById(id)` - Obter detalhes de um agendamento
- `appointments.create(data)` - Criar novo agendamento
- `appointments.update(id, data)` - Atualizar agendamento

### Agent Config
- `agentConfig.get()` - Obter configurações do agente
- `agentConfig.upsert(data)` - Salvar/atualizar configurações

### Integrations
- `integrations.get()` - Obter credenciais de integrações
- `integrations.upsert(data)` - Salvar/atualizar credenciais

### Event Logs
- `eventLogs.getByLeadId(leadId)` - Obter histórico de eventos de um lead

## 🔐 Segurança

- **Autenticação**: Manus OAuth integrado
- **Proteção de Rotas**: Todas as páginas requerem autenticação
- **Criptografia**: Credenciais de API armazenadas com segurança
- **CORS**: Configurado para aceitar apenas requisições autorizadas

## 🎨 Design

- **Tema Premium**: Paleta de cores sofisticada com Tailwind CSS
- **Sidebar Navegável**: Menu colapsível com ícones intuitivos
- **Componentes Reutilizáveis**: shadcn/ui para consistência
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Dark Mode Ready**: Suporte para tema escuro

## 📊 Gráficos e Visualizações

- **Pie Chart**: Distribuição de leads por status
- **Line Chart**: Tendência de agendamentos ao longo da semana
- **Cards com Ícones**: Métricas principais com visual destacado
- **Tabelas Interativas**: Listagens com filtros e busca

## 🧪 Testes

Executar testes unitários:
```bash
pnpm test
```

Testes incluem:
- ✅ CRUD de leads
- ✅ CRUD de agendamentos
- ✅ Configurações do agente
- ✅ Integrações
- ✅ Log de eventos

## 📝 Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@host:3306/database

# Autenticação
JWT_SECRET=sua-chave-secreta-aqui
VITE_APP_ID=seu-app-id-manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Integração Meta/WhatsApp
WHATSAPP_TOKEN=seu-token-meta
WHATSAPP_PHONE_ID=seu-phone-id
WHATSAPP_VERIFY_TOKEN=seu-verify-token

# OpenAI
OPENAI_API_KEY=sk-sua-chave-aqui
```

## 🔄 Fluxo de Dados

1. **Recebimento**: Mensagem chega via webhook do WhatsApp
2. **Processamento**: Agente de IA analisa e classifica o lead
3. **Armazenamento**: Lead é salvo no banco com status e estágio
4. **Acompanhamento**: Sistema de follow-up automático entra em ação
5. **Visualização**: Dados aparecem em tempo real no painel

## 🛠️ Customização

### Alterar Tom de Voz do Agente
1. Acesse a página "Agente IA"
2. Selecione um tom de voz (formal/neutro/informal)
3. Customize o System Prompt conforme necessário
4. Adicione exemplos de diálogos para melhorar respostas
5. Clique em "Salvar Configurações"

### Adicionar Novos Campos ao Lead
1. Edite `drizzle/schema.ts`
2. Adicione a coluna desejada
3. Execute `pnpm drizzle-kit generate`
4. Aplique a migration via SQL
5. Atualize os procedures tRPC em `server/routers.ts`
6. Adicione os campos na UI em `client/src/pages/Leads.tsx`

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação acima
2. Consulte os logs em `.manus-logs/`
3. Verifique se todas as integrações estão configuradas
4. Execute os testes com `pnpm test`

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ pelo time MagicFlow.**
