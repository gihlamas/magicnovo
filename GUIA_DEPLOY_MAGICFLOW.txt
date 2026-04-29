# Guia de Deploy Simplificado: MagicFlow na sua VPS

Olá! Este guia foi feito para você, que não é desenvolvedora e está começando com servidores VPS. Meu objetivo é tornar o processo de colocar o MagicFlow no ar o mais simples possível, com o mínimo de comandos e sem complicação.

Vamos lá!

## 🚀 O que você vai precisar:

1.  **Uma VPS (Servidor Virtual Privado)**: É o seu "computador na nuvem". Você pode contratar de provedores como DigitalOcean, Linode, AWS Lightsail, etc. Recomendo uma VPS com **Ubuntu 22.04 LTS**.
2.  **Acesso SSH à sua VPS**: Geralmente, você acessa a VPS usando um programa como o `PuTTY` (Windows) ou o `Terminal` (macOS/Linux). Você precisará do IP da sua VPS e da senha (ou chave SSH).
3.  **O arquivo `MagicFlow_Deploy.zip`**: Este é o pacote que preparei para você, contendo todo o projeto e o script de instalação.

## 📦 Passo 1: Conectar à sua VPS e Enviar o Projeto

Primeiro, você precisa se conectar à sua VPS e enviar o arquivo do projeto para lá.

### 1.1. Conectar via SSH

Abra o seu terminal (ou PuTTY) e digite o comando abaixo, substituindo `seu_usuario` pelo nome de usuário da sua VPS (geralmente `root` ou `ubuntu`) e `IP_DA_SUA_VPS` pelo endereço IP do seu servidor:

```bash
ssh seu_usuario@IP_DA_SUA_VPS
```

Se for a primeira vez, ele pode perguntar se você confia no host. Digite `yes` e pressione Enter. Em seguida, digite sua senha (ela não aparecerá enquanto você digita, o que é normal) e pressione Enter.

Você verá algo como `seu_usuario@nome_da_vps:~$`.

### 1.2. Enviar o arquivo `.zip` para a VPS

Agora, você precisa enviar o arquivo `MagicFlow_Deploy.zip` da sua máquina para a VPS. Para isso, você pode usar o comando `scp` no seu **terminal local** (não na VPS).

Abra uma **nova janela do terminal** no seu computador (sem fechar a conexão SSH com a VPS) e digite:

```bash
scp /caminho/para/MagicFlow_Deploy.zip seu_usuario@IP_DA_SUA_VPS:/home/seu_usuario/
```

-   Substitua `/caminho/para/MagicFlow_Deploy.zip` pelo caminho completo onde você salvou o arquivo na sua máquina (ex: `/Users/seu_nome/Downloads/MagicFlow_Deploy.zip` ou `C:\Users\seu_nome\Downloads\MagicFlow_Deploy.zip`).
-   Substitua `seu_usuario` e `IP_DA_SUA_VPS` novamente.

Digite sua senha da VPS quando solicitado. O arquivo será copiado para a pasta `/home/seu_usuario/` na sua VPS.

## ⚙️ Passo 2: Executar o Script de Instalação Mágica

Volte para a janela do terminal onde você está conectado à sua VPS.

### 2.1. Descompactar o Projeto

Primeiro, vamos descompactar o arquivo que você enviou:

```bash
unzip MagicFlow_Deploy.zip
```

Isso criará uma pasta chamada `magicflow` (ou similar) com todos os arquivos dentro.

### 2.2. Tornar o Script Executável

Agora, vamos dar permissão de execução ao nosso script mágico:

```bash
chmod +x magicflow/setup.sh
```

### 2.3. Rodar o Script de Instalação

Este é o momento! Digite o comando abaixo e pressione Enter. O script fará todo o trabalho pesado para você:

```bash
sudo magicflow/setup.sh
```

O script vai:
-   Atualizar o sistema.
-   Instalar o Node.js e o pnpm (gerenciador de pacotes).
-   Mover o projeto para a pasta `/home/ubuntu/magicflow`.
-   Instalar todas as dependências do projeto.
-   Construir o frontend e o backend para produção.
-   Instalar e configurar o PM2 (um gerenciador de processos que mantém seu aplicativo rodando 24/7 e o reinicia automaticamente se o servidor cair).

Isso pode levar alguns minutos. Aguarde até ver a mensagem de **SUCESSO** no final.

## ✅ Passo 3: Verificar se o MagicFlow está Rodando

Após o script terminar, você pode verificar o status dos seus aplicativos:

```bash
pm2 list
```

Você deverá ver algo parecido com:

```
┌────┬────────────────────┬──────────┬──────┬───────────┬───────────┬─────────┬────┬───────────┬───────────┬───────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu       │ memory    │ user │ `pid`       │ `uptime`    │ `restart`   │
├────┼────────────────────┼──────────┼──────┼───────────┼───────────┼─────────┼────┼───────────┼───────────┼───────────┤
│ 0  │ magicflow-backend  │ cluster  │ 0    │ online    │ 0%        │ 50.0 MB   │ ubuntu │ 12345     │ 0s          │ 0         │
│ 1  │ magicflow-frontend │ fork     │ 0    │ online    │ 0%        │ 30.0 MB   │ ubuntu │ 67890     │ 0s          │ 0         │
└────┴────────────────────┴──────────┴──────┴───────────┴───────────┴─────────┴────┴───────────┴───────────┴───────────┘
```

Se `status` estiver como `online` para ambos, parabéns! Seu MagicFlow está rodando na VPS.

### Acessando o Frontend

Por padrão, o frontend estará disponível na porta `5173` da sua VPS. Para acessá-lo do seu navegador, você precisará digitar:

`http://IP_DA_SUA_VPS:5173`

**Importante**: Para ter um acesso mais profissional (ex: `https://seusistema.com.br`) e seguro, você precisará configurar um **proxy reverso** (como Nginx) e um domínio. Isso não está coberto neste guia simplificado, mas é o próximo passo para um ambiente de produção completo.

## 📝 Passo 4: Configurações Finais (Importante!)

O script de instalação moveu o arquivo `.env` para a pasta do projeto (`/home/ubuntu/magicflow/.env`). Este arquivo contém as variáveis de ambiente, como as chaves de API do WhatsApp e OpenAI.

**Você PRECISA editar este arquivo com suas credenciais reais!**

Para editar, digite:

```bash
nano /home/ubuntu/magicflow/.env
```

-   Use as setas do teclado para navegar.
-   Substitua `seu_token_aqui`, `seu_phone_id_aqui` e `sua_chave_openai_aqui` pelas suas informações reais.
-   Pressione `Ctrl + X` para sair, `Y` para salvar e Enter para confirmar.

Após editar o `.env`, você precisará reiniciar o backend para que as novas configurações sejam aplicadas:

```bash
pm2 restart magicflow-backend
```

## 🎉 Parabéns!

Você instalou e configurou o MagicFlow na sua VPS! Agora você tem um sistema robusto rodando 24/7. Se tiver qualquer dúvida ou precisar de ajuda, não hesite em perguntar. Estou aqui para ajudar!
