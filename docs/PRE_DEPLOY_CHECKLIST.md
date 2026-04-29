# Checklist de Pré-Deploy - MagicFlow

**Versão**: 1.0.0  
**Data**: Abril de 2026  
**Status**: ✅ PRONTO PARA DEPLOY

---

## 📋 Verificações Técnicas

### Segurança de Variáveis de Ambiente

- [x] ✅ Removidos fallbacks inseguros (`"default-key"`, `"whatsapp_verify_token_123"`)
- [x] ✅ Validação de variáveis críticas implementada
- [x] ✅ `.env.example` atualizado com TODAS as variáveis
- [x] ✅ Variáveis não documentadas foram documentadas
- [x] ✅ CORS padrão inseguro corrigido
- [x] ✅ Referências ao Perfex removidas
- [x] ✅ Arquivo `.gitignore` criado (`.env` não será commitado)

### Estrutura do Projeto

- [x] ✅ Projeto reorganizado em estrutura profissional
- [x] ✅ Frontend separado em `src/frontend/`
- [x] ✅ Backend separado em `src/backend/`
- [x] ✅ Banco de dados em `src/database/`
- [x] ✅ Configurações em `config/`
- [x] ✅ Documentação em `docs/`

### Documentação

- [x] ✅ README.md criado
- [x] ✅ DEPLOY.md com instruções passo a passo
- [x] ✅ GUIA_TECNICO_MAGICADS.md
- [x] ✅ GUIA_USUARIO_MAGICADS.md
- [x] ✅ AUDITORIA_ENV.md com análise de segurança

### Integração MagicAds

- [x] ✅ Webhook configurado e documentado
- [x] ✅ Validação de API Key implementada
- [x] ✅ Processamento de leads funcionando
- [x] ✅ Sincronização de follow-up preparada

### Integração WhatsApp

- [x] ✅ Webhook de verificação implementado
- [x] ✅ Processamento de mensagens funcionando
- [x] ✅ Integração com OpenAI preparada
- [x] ✅ Envio de mensagens estruturado

### Banco de Dados

- [x] ✅ Schema criado (Drizzle ORM)
- [x] ✅ Migrações SQL disponíveis
- [x] ✅ Suporte para PostgreSQL e MySQL
- [x] ✅ Conexão lazy-loaded implementada

---

## 🔒 Segurança

### Variáveis de Ambiente Críticas

Antes de fazer deploy, configure OBRIGATORIAMENTE:

```bash
# WhatsApp (Meta Cloud API)
WHATSAPP_TOKEN=<seu_token>
WHATSAPP_PHONE_NUMBER_ID=<seu_phone_id>
WHATSAPP_ACCESS_TOKEN=<seu_access_token>
WHATSAPP_VERIFY_TOKEN=<seu_token_verificacao>

# OpenAI
OPENAI_API_KEY=sk-<sua_chave>

# Banco de Dados
DATABASE_URL=postgresql://user:pass@host:5432/magicflow

# Servidor
ALLOWED_ORIGINS=https://seu-dominio.com
NODE_ENV=production
```

### Validações em Produção

O servidor vai falhar com mensagens claras se faltar:
- ✅ `WHATSAPP_TOKEN`
- ✅ `WHATSAPP_PHONE_NUMBER_ID`
- ✅ `WHATSAPP_VERIFY_TOKEN`
- ✅ `OPENAI_API_KEY`
- ✅ `ALLOWED_ORIGINS` (em produção)

---

## 📦 Dependências

### Backend

```json
{
  "@tanstack/react-query": "^5.99.2",
  "@trpc/client": "^11.16.0",
  "@trpc/react-query": "^11.16.0",
  "@trpc/server": "^11.16.0",
  "axios": "^1.6.7",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.18.3",
  "express-rate-limit": "^7.2.0",
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "morgan": "^1.10.0",
  "node-cron": "^3.0.3",
  "openai": "^4.28.4",
  "pg": "^8.11.3",
  "sequelize": "^6.37.1",
  "uuid": "^9.0.1",
  "winston": "^3.11.0"
}
```

### Instalar Dependências

```bash
cd /home/ubuntu/projeto
pnpm install
```

---

## 🚀 Passos para Deploy

### 1. Preparar a VPS

Siga o guia em `docs/DEPLOY.md`:

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PostgreSQL/MySQL
sudo apt install -y postgresql postgresql-contrib
# ou
sudo apt install -y mysql-server
```

### 2. Clonar Projeto

```bash
cd /var/www
git clone <seu-repositorio> magicflow
cd magicflow
```

### 3. Configurar Variáveis

```bash
cp .env.example .env
nano .env  # Editar com suas credenciais
```

### 4. Instalar Dependências

```bash
pnpm install
```

### 5. Configurar Banco de Dados

```bash
# PostgreSQL
psql -U postgres -c "CREATE DATABASE magicflow;"
psql -U magicflow -d magicflow < src/database/0001_new_magma.sql
psql -U magicflow -d magicflow < src/database/0002_daffy_loners.sql

# Ou MySQL
mysql -u root -p < src/database/0001_new_magma.sql
mysql -u root -p < src/database/0002_daffy_loners.sql
```

### 6. Configurar Nginx

```bash
sudo cp docs/nginx.conf /etc/nginx/sites-available/magicflow
sudo ln -s /etc/nginx/sites-available/magicflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Configurar SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d seu-dominio.com
```

### 8. Iniciar com PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🧪 Testes Pós-Deploy

### 1. Verificar Servidor

```bash
curl -I https://seu-dominio.com
# Deve retornar 200 OK
```

### 2. Testar Webhook MagicAds

```bash
curl -X POST https://seu-dominio.com/api/trpc/magicads.receiveWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sua_chave_aqui",
    "lead": {
      "name": "Teste",
      "email": "teste@example.com",
      "phone": "+5511999999999",
      "campaignId": "test_123",
      "campaignName": "Teste"
    }
  }'
```

### 3. Verificar Logs

```bash
pm2 logs magicflow
tail -f /var/log/nginx/magicflow_error.log
```

### 4. Monitorar Banco de Dados

```bash
psql -U magicflow -d magicflow -c "SELECT COUNT(*) FROM leads;"
```

---

## 📊 Monitoramento em Produção

### Logs

```bash
# Aplicação
pm2 logs magicflow

# Nginx
sudo tail -f /var/log/nginx/magicflow_access.log
sudo tail -f /var/log/nginx/magicflow_error.log

# Banco de dados
sudo tail -f /var/log/postgresql/postgresql.log
```

### Backup Automático

```bash
# Criar script de backup
cat > /home/ubuntu/backup_magicflow.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U magicflow magicflow > /backups/magicflow_$DATE.sql
gzip /backups/magicflow_$DATE.sql
EOF

# Agendar com cron
0 2 * * * /home/ubuntu/backup_magicflow.sh
```

---

## 🆘 Troubleshooting

### Servidor não inicia

```bash
pm2 logs magicflow
# Verificar variáveis de ambiente
cat .env
# Verificar conectividade com banco
psql -U magicflow -d magicflow -c "SELECT 1;"
```

### Webhook não recebe mensagens

```bash
# Verificar Nginx
sudo nginx -t
# Verificar firewall
sudo ufw status
sudo ufw allow 443/tcp
# Verificar logs
sudo tail -f /var/log/nginx/magicflow_error.log
```

### Banco de dados cheio

```bash
# PostgreSQL
SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname))
FROM pg_database ORDER BY pg_database_size(pg_database.datname) DESC;

# MySQL
SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables GROUP BY table_schema;
```

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados criado e migrações executadas
- [ ] Nginx configurado com SSL
- [ ] PM2 iniciado e salvado
- [ ] Webhook testado com sucesso
- [ ] Logs monitorados
- [ ] Backup automático configurado
- [ ] Domínio apontando para a VPS
- [ ] HTTPS funcionando
- [ ] Testes de carga realizados (opcional)

---

## 📞 Suporte

Para problemas durante o deploy:

1. Consulte `docs/DEPLOY.md` para instruções detalhadas
2. Verifique os logs: `pm2 logs magicflow`
3. Consulte a documentação oficial do Node.js, Nginx e seu banco de dados
4. Verifique a auditoria de segurança: `docs/AUDITORIA_ENV.md`

---

**Status**: 🟢 **PRONTO PARA DEPLOY**

Commit: `8307135`  
Data: Abril de 2026
