# Estrutura Reorganizada do Projeto MagicFlow

## 📁 Hierarquia de Diretórios

```
magicflow/
├── src/
│   ├── backend/                    # Backend TypeScript/Express
│   │   ├── api/                    # Rotas tRPC
│   │   │   ├── routers.ts          # Roteador principal tRPC
│   │   │   └── magicads.ts         # Integração MagicAds
│   │   ├── services/               # Lógica de negócio
│   │   │   ├── integration-tests.service.ts
│   │   │   ├── integration-validation.service.ts
│   │   │   └── magicads-integration.ts
│   │   ├── webhooks/               # Webhooks do WhatsApp
│   │   │   └── whatsapp.routes.ts
│   │   ├── middleware/             # Middlewares Express
│   │   ├── utils/                  # Funções utilitárias
│   │   ├── index.ts                # Entrypoint alternativo
│   │   └── server.ts               # Servidor Express principal
│   ├── frontend/                   # Frontend React
│   │   ├── pages/                  # Páginas da aplicação
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Integrations.tsx
│   │   │   ├── IntegrationTests.tsx
│   │   │   └── ...
│   │   ├── components/             # Componentes reutilizáveis
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── MagicAds.tsx
│   │   ├── hooks/                  # React Hooks customizados
│   │   ├── styles/                 # Estilos CSS/Tailwind
│   │   │   └── globals.css
│   │   ├── App.tsx                 # Componente raiz
│   │   └── main.tsx                # Entrypoint React
│   └── database/                   # Camada de dados
│       ├── db.ts                   # Queries com Drizzle ORM
│       ├── schema.ts               # Definição de tabelas
│       └── database.js             # Adapter Sequelize (legado)
├── config/                         # Configurações
│   ├── env.js                      # Variáveis de ambiente
│   ├── server.js                   # Config do servidor (legado)
│   ├── ecosystem.config.js         # PM2 config
│   └── nginx.conf                  # Config Nginx
├── docs/                           # Documentação
│   ├── README_MAGICFLOW.md
│   ├── DEPLOY.md
│   ├── AUDITORIA_ENV.md
│   ├── todo.md
│   └── ...
├── .env                            # Variáveis de ambiente
├── .env.example                    # Template de env
├── .gitignore                      # Git ignore
├── package.json                    # Dependências
├── tsconfig.json                   # Config TypeScript
├── vite.config.ts                  # Config Vite
├── tailwind.config.js              # Config Tailwind
├── postcss.config.js               # Config PostCSS
├── index.html                      # HTML raiz
└── README.md                       # Documentação principal
```

## 🔄 Fluxo de Imports Corrigido

### Backend (src/backend/)
```typescript
// ✅ Correto: Imports relativos ao novo layout
import { appRouter } from "./api/routers";
import { validateIntegrationInput } from "./services/integration-validation.service";
import { getDb } from "../../database/db";
import { leads, schema } from "../../database/schema";
```

### Frontend (src/frontend/)
```typescript
// ✅ Correto: Imports de componentes
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
```

### Database (src/database/)
```typescript
// ✅ Correto: Imports de schema
import { schema } from "./schema";
import { drizzle } from "drizzle-orm/mysql2";
```

## 📦 Dependências Principais

| Pacote | Versão | Propósito |
|--------|--------|----------|
| express | ^4.18.3 | Framework Web |
| @trpc/server | ^11.16.0 | API RPC |
| react | ^18.2.0 | UI Framework |
| drizzle-orm | ^0.29.1 | ORM |
| vite | ^8.0.9 | Build tool |
| tailwindcss | ^3.3.6 | CSS Framework |
| typescript | ^6.0.2 | Linguagem |
| zod | ^4.3.6 | Validação |

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia backend com hot-reload
pnpm dev:frontend    # Inicia frontend Vite
pnpm dev:all         # Inicia backend e frontend em paralelo

# Build
pnpm build           # Build completo (backend + frontend)
pnpm build:backend   # Build apenas backend
pnpm build:frontend  # Build apenas frontend

# Produção
pnpm start           # Inicia servidor em produção
pnpm preview         # Preview do build

# Testes e Qualidade
pnpm test            # Executa testes
pnpm lint            # Verifica código
pnpm format          # Formata código
```

## ✅ Validações Realizadas

- [x] Estrutura de diretórios criada
- [x] Arquivos movidos para pastas corretas
- [x] Imports corrigidos em arquivos principais
- [x] Arquivos de configuração criados (tsconfig, vite, tailwind)
- [x] Package.json atualizado com scripts corretos
- [x] Arquivo .env criado com variáveis padrão
- [x] Arquivos de entrada (server.ts, main.tsx) criados

## 🔧 Próximos Passos

1. **Instalar dependências**: `pnpm install`
2. **Configurar banco de dados**: Atualizar DATABASE_URL no .env
3. **Executar migrações**: Criar tabelas no banco de dados
4. **Iniciar desenvolvimento**: `pnpm dev:all`
5. **Testar endpoints**: Acessar http://localhost:3000/health

## 📝 Notas Importantes

- O projeto agora usa **Drizzle ORM** em vez de Sequelize
- Frontend usa **Vite** para desenvolvimento rápido
- Backend usa **tRPC** para type-safe APIs
- Estilos usam **Tailwind CSS**
- Validação com **Zod**
- TypeScript em modo strict

## 🐛 Troubleshooting

Se encontrar erros de imports:
1. Verifique se os caminhos relativos estão corretos
2. Confirme que os arquivos estão nas pastas esperadas
3. Limpe o cache: `rm -rf node_modules/.vite`
4. Reinstale dependências: `pnpm install`
