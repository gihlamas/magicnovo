# Guia de Deploy: MagicFlow em VPS

Este guia fornece instruções passo a passo para fazer deploy do MagicFlow em uma VPS (Ubuntu/Debian).

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de que sua VPS possui:

- **Sistema Operacional**: Ubuntu 20.04+ ou Debian 11+
- **Node.js**: Versão 18 ou superior
- **pnpm**: Gerenciador de pacotes
- **Banco de Dados**: PostgreSQL 12+ ou MySQL 8+
- **Nginx**: Servidor web/proxy reverso
- **SSL/TLS**: Certificado (Let's Encrypt recomendado)
- **Acesso SSH**: Com privilégios sudo

---

## 🚀 Passo 1: Preparar a VPS

### 1.1 Atualizar o sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Instalar dependências do sistema

```bash
sudo apt install -y \
  curl \
  wget \
  git \
  build-essential \
  python3 \
  postgresql-client \
  mysql-client
```

### 1.3 Instalar Node.js

```bash
# Usando NodeSource (recomendado)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 1.4 Instalar pnpm

```bash
npm install -g pnpm

# Verificar instalação
pnpm --version
```

---

## 🗄️ Passo 2: Configurar o Banco de Dados

### 2.1 Para PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco de dados e usuário
sudo -u postgres psql << EOF
CREATE DATABASE magicflow;
CREATE USER magicflow_user WITH PASSWORD 'sua_senha_segura_aqui';
ALTER ROLE magicflow_user SET client_encoding TO 'utf8';
ALTER ROLE magicflow_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE magicflow_user SET default_transaction_deferrable TO on;
ALTER ROLE magicflow_user SET default_transaction_level TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE magicflow TO magicflow_user;
\q
EOF
```

### 2.2 Para MySQL

```bash
# Instalar MySQL
sudo apt install -y mysql-server

# Iniciar o serviço
sudo systemctl start mysql
sudo systemctl enable mysql

# Criar banco de dados e usuário
sudo mysql -u root << EOF
CREATE DATABASE magicflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'magicflow_user'@'localhost' IDENTIFIED BY 'sua_senha_segura_aqui';
GRANT ALL PRIVILEGES ON magicflow.* TO 'magicflow_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

### 2.3 Executar migrações

```bash
# Conectar ao banco e executar os arquivos SQL
# Para PostgreSQL:
psql -U magicflow_user -d magicflow < src/database/0001_new_magma.sql
psql -U magicflow_user -d magicflow < src/database/0002_daffy_loners.sql

# Para MySQL:
mysql -u magicflow_user -p magicflow < src/database/0001_new_magma.sql
mysql -u magicflow_user -p magicflow < src/database/0002_daffy_loners.sql
```

---

## 📁 Passo 3: Clonar e Configurar o Projeto

### 3.1 Clonar o repositório

```bash
# Criar diretório para a aplicação
sudo mkdir -p /var/www/magicflow
cd /var/www/magicflow

# Se estiver usando Git:
sudo git clone <seu-repositorio> .

# Ou copiar os arquivos manualmente
sudo cp -r /caminho/local/magicflow/* .

# Ajustar permissões
sudo chown -R $USER:$USER /var/www/magicflow
```

### 3.2 Instalar dependências

```bash
cd /var/www/magicflow
pnpm install
```

### 3.3 Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com suas credenciais
nano .env
```

**Exemplo de `.env`**:

```env
# Banco de Dados
DATABASE_URL=postgresql://magicflow_user:sua_senha_segura_aqui@localhost:5432/magicflow
# ou para MySQL:
# DATABASE_URL=mysql://magicflow_user:sua_senha_segura_aqui@localhost:3306/magicflow

# WhatsApp (Meta Cloud API)
WHATSAPP_TOKEN=seu_token_aqui
WHATSAPP_PHONE_ID=seu_phone_id_aqui
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_token_de_verificacao

# OpenAI
OPENAI_API_KEY=sk-...

# MagicAds
MAGICADS_API_KEY=sua_chave_aqui

# Servidor
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://seu-dominio.com

# Segurança
JWT_SECRET=gere_uma_chave_segura_aqui
```

---

## 🔒 Passo 4: Configurar Nginx como Proxy Reverso

### 4.1 Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4.2 Criar configuração do site

```bash
sudo nano /etc/nginx/sites-available/magicflow
```

**Conteúdo do arquivo**:

```nginx
upstream magicflow {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/magicflow_access.log;
    error_log /var/log/nginx/magicflow_error.log;

    # Tamanho máximo de upload
    client_max_body_size 50M;

    location / {
        proxy_pass http://magicflow;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhook do WhatsApp (sem autenticação para receber mensagens)
    location /webhook {
        proxy_pass http://magicflow;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 4.3 Habilitar o site

```bash
sudo ln -s /etc/nginx/sites-available/magicflow /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

### 4.4 Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot certonly --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🔄 Passo 5: Configurar PM2 (Gerenciador de Processos)

### 5.1 Instalar PM2

```bash
sudo npm install -g pm2
```

### 5.2 Criar arquivo de configuração

```bash
cd /var/www/magicflow
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'magicflow',
    script: './src/index.ts',
    interpreter: 'npx tsx',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/magicflow/error.log',
    out_file: '/var/log/magicflow/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF
```

### 5.3 Iniciar a aplicação com PM2

```bash
# Criar diretório de logs
sudo mkdir -p /var/log/magicflow
sudo chown $USER:$USER /var/log/magicflow

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar startup automático
pm2 startup
# Copie e execute o comando que aparecer
```

---

## 🧪 Passo 6: Testar o Deploy

### 6.1 Verificar se o servidor está rodando

```bash
# Verificar status PM2
pm2 status

# Verificar logs
pm2 logs magicflow

# Testar conexão
curl -I https://seu-dominio.com
```

### 6.2 Testar webhook do MagicAds

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

---

## 📊 Passo 7: Monitoramento e Manutenção

### 7.1 Monitorar logs

```bash
# Logs da aplicação
pm2 logs magicflow

# Logs do Nginx
sudo tail -f /var/log/nginx/magicflow_error.log
sudo tail -f /var/log/nginx/magicflow_access.log

# Logs do banco de dados
sudo tail -f /var/log/postgresql/postgresql.log  # PostgreSQL
sudo tail -f /var/log/mysql/error.log            # MySQL
```

### 7.2 Backup do banco de dados

```bash
# PostgreSQL
pg_dump -U magicflow_user magicflow > backup_$(date +%Y%m%d).sql

# MySQL
mysqldump -u magicflow_user -p magicflow > backup_$(date +%Y%m%d).sql
```

### 7.3 Atualizar a aplicação

```bash
cd /var/www/magicflow

# Puxar atualizações
git pull origin main

# Reinstalar dependências
pnpm install

# Reiniciar aplicação
pm2 restart magicflow
```

---

## 🆘 Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
pm2 logs magicflow

# Verificar variáveis de ambiente
cat .env

# Testar conexão com banco de dados
psql -U magicflow_user -d magicflow -c "SELECT 1;"
```

### Webhook não recebe mensagens

```bash
# Verificar se o Nginx está redirecionando corretamente
sudo nginx -t

# Verificar firewall
sudo ufw status
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/magicflow_error.log
```

### Banco de dados cheio

```bash
# PostgreSQL
SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname))
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;

# MySQL
SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
GROUP BY table_schema;
```

---

## 📝 Checklist Final

- [ ] Node.js 18+ instalado
- [ ] pnpm instalado
- [ ] Banco de dados criado e configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Nginx instalado e configurado
- [ ] SSL/TLS configurado
- [ ] PM2 instalado e aplicação rodando
- [ ] Webhook do MagicAds testado
- [ ] Backups configurados
- [ ] Monitoramento ativo

---

## 📞 Suporte

Para problemas durante o deploy, consulte:
- Logs da aplicação: `pm2 logs magicflow`
- Logs do Nginx: `/var/log/nginx/magicflow_error.log`
- Documentação oficial do Node.js, Nginx e seu banco de dados

---

**Versão**: 1.0.0  
**Última atualização**: Abril de 2026
