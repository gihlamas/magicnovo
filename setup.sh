#!/bin/bash

# --- Configurações Iniciais ---
PROJECT_DIR="/home/ubuntu/magicflow"
FRONTEND_PORT=5173
BACKEND_PORT=3000

# --- Funções Auxiliares ---
log_info() { echo -e "\n\033[0;36m[INFO]\033[0m $1"; }
log_success() { echo -e "\n\033[0;32m[SUCESSO]\033[0m $1"; }
log_error() { echo -e "\n\033[0;31m[ERRO]\033[0m $1"; exit 1; }
log_warning() { echo -e "\n\033[0;33m[AVISO]\033[0m $1"; }

# --- 1. Atualizar o sistema e instalar dependências essenciais ---
log_info "Atualizando o sistema e instalando dependências essenciais..."
sudo apt update -y || log_error "Falha ao atualizar pacotes."
sudo apt install -y curl git || log_error "Falha ao instalar curl/git."

# --- 2. Instalar Node.js (se não estiver instalado) ---
if ! command -v node &> /dev/null
then
    log_info "Node.js não encontrado. Instalando Node.js v20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - || log_error "Falha ao adicionar repositório NodeSource."
    sudo apt install -y nodejs || log_error "Falha ao instalar Node.js."
    log_success "Node.js instalado com sucesso: $(node -v)"
else
    log_info "Node.js já está instalado: $(node -v)"
fi

# --- 3. Instalar pnpm (se não estiver instalado) ---
if ! command -v pnpm &> /dev/null
then
    log_info "pnpm não encontrado. Instalando pnpm..."
    curl -fsSL https://get.pnpm.io/install.sh | sh - || log_error "Falha ao baixar script de instalação do pnpm."
    export PNPM_HOME="$HOME/.local/share/pnpm"
    export PATH="$PNPM_HOME:$PATH"
    log_success "pnpm instalado com sucesso: $(pnpm -v)"
else
    log_info "pnpm já está instalado: $(pnpm -v)"
fi

# Garantir que o pnpm esteja no PATH para o resto do script
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# --- 4. Criar diretório do projeto e mover arquivos ---
log_info "Criando diretório do projeto em $PROJECT_DIR..."
sudo mkdir -p $PROJECT_DIR || log_error "Falha ao criar diretório do projeto."
sudo chown -R $USER:$USER $PROJECT_DIR || log_error "Falha ao definir permissões do diretório."

log_info "Movendo arquivos do projeto para $PROJECT_DIR..."
mv /home/ubuntu/projeto_atual/* $PROJECT_DIR/ || log_error "Falha ao mover arquivos do projeto."
cd $PROJECT_DIR || log_error "Falha ao entrar no diretório do projeto."

# --- 5. Instalar dependências do projeto ---
log_info "Instalando dependências do projeto (isso pode levar alguns minutos)..."
pnpm install || log_error "Falha ao instalar dependências do projeto."

# --- 6. Construir o projeto (build) ---
log_info "Construindo o projeto para produção..."
pnpm build || log_error "Falha ao construir o projeto."

# --- 7. Instalar PM2 (se não estiver instalado) ---
if ! command -v pm2 &> /dev/null
then
    log_info "PM2 não encontrado. Instalando PM2 globalmente..."
    pnpm add pm2 -g || log_error "Falha ao instalar PM2."
    log_success "PM2 instalado com sucesso: $(pm2 -v)"
else
    log_info "PM2 já está instalado: $(pm2 -v)"
fi

# --- 8. Configurar e iniciar o aplicativo com PM2 ---
log_info "Configurando e iniciando o MagicFlow com PM2..."

# Criar arquivo ecosystem.config.js se não existir
if [ ! -f ecosystem.config.js ]; then
  log_info "Criando ecosystem.config.js..."
  cat << EOF > ecosystem.config.js
module.exports = {
  apps : [{
    name: "magicflow-backend",
    script: "dist/backend/server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: ${BACKEND_PORT},
      DATABASE_URL: "file:./dev.db" // Usar SQLite para simplicidade inicial
    }
  }, {
    name: "magicflow-frontend",
    script: "pnpm",
    args: "preview --port ${FRONTEND_PORT} --host",
    interpreter: "bash",
    env: {
      NODE_ENV: "production"
    }
  }]
};
EOF
fi

pm2 start ecosystem.config.js || log_error "Falha ao iniciar MagicFlow com PM2."

# --- 9. Configurar PM2 para iniciar no boot do sistema ---
log_info "Configurando PM2 para iniciar automaticamente no boot do sistema..."
pm2 startup || log_error "Falha ao gerar comando de startup do PM2."
pm2 save || log_error "Falha ao salvar configuração do PM2."

log_success "\n🎉 MagicFlow instalado e configurado com sucesso! 🎉"
log_info "O backend está rodando na porta ${BACKEND_PORT} e o frontend na porta ${FRONTEND_PORT}."
log_info "Você pode verificar o status com: pm2 list"
log_info "Para ver os logs do backend: pm2 logs magicflow-backend"
log_info "Para ver os logs do frontend: pm2 logs magicflow-frontend"
log_info "Lembre-se de configurar um proxy reverso (Nginx) para acessar o frontend pela porta 80/443."
log_info "O arquivo .env foi movido para $PROJECT_DIR. Edite-o para configurar as variáveis de ambiente reais."
