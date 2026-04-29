# MagicFlow - Roadmap de Desenvolvimento

## Banco de Dados e Backend

- [x] Criar tabelas: leads, appointments, agent_configs, integrations, event_logs
- [x] Implementar query helpers em server/db.ts
- [x] Criar procedures tRPC para CRUD de leads
- [x] Criar procedures tRPC para CRUD de agendamentos
- [x] Criar procedures tRPC para configurações do agente
- [x] Criar procedures tRPC para integrações (Meta, OpenAI)
- [x] Implementar autenticação e autorização

## Frontend - Layout e Navegação

- [x] Criar DashboardLayout com sidebar navegável
- [x] Implementar header com perfil de usuário
- [x] Criar estrutura de rotas no App.tsx
- [x] Adicionar temas e estilos globais (design premium)

## Dashboard Principal

- [x] Implementar cards de métricas (total leads, quentes, mornos, frios)
- [x] Criar gráfico de agendamentos do dia
- [x] Exibir taxa de conversão
- [x] Adicionar widgets com últimos leads e agendamentos

## Gestão de Leads

- [x] Criar página de listagem com tabela
- [x] Implementar filtros por status (quente/morno/frio)
- [x] Implementar filtros por estágio (novo/qualificado/agendado/encerrado)
- [x] Adicionar busca por nome ou telefone
- [x] Criar página de detalhes do lead
- [x] Implementar histórico de eventos do lead
- [x] Adicionar opção de editar dados do lead
- [x] Criar formulário de edição (nome, serviço, status, notas)

## Gestão de Agendamentos

- [x] Criar calendário interativo
- [x] Implementar listagem de agendamentos
- [x] Adicionar filtro por data
- [x] Criar opção de atualizar status (confirmado, cancelado, realizado)
- [ ] Implementar notificações de agendamentos

## Personalização do Agente de IA

- [x] Criar página de editor de prompt
- [x] Implementar campo de texto para System Prompt
- [x] Adicionar seletor de tom de voz (formal, neutro, informal)
- [x] Implementar campo de exemplos de diálogo (few-shot)
- [x] Adicionar preview em tempo real do comportamento da IA
- [x] Salvar configurações no banco de dados

## Configurações de Integração

- [x] Criar página de configurações
- [x] Adicionar campos para chave da Meta (WhatsApp)
- [x] Adicionar campos para chave da OpenAI
- [x] Implementar validação de credenciais
- [x] Adicionar testes de conexão para cada integração

## Log de Eventos

- [x] Implementar visualização de eventos por lead
- [x] Exibir tipo de evento, status e payload
- [ ] Adicionar filtros por tipo de evento
- [ ] Implementar atualização em tempo real (polling ou WebSocket)

## Testes e Refinamento

- [x] Testes unitários dos procedures tRPC
- [ ] Testes de UI com Vitest
- [ ] Validação de design e UX
- [ ] Otimização de performance
- [x] Checkpoint final e documentação


## Integrações Backend (Nova Fase)

- [x] Implementar serviço OpenAI com processamento de mensagens
- [x] Implementar motor de classificação de leads (quente/morno/frio)
- [x] Implementar webhook WhatsApp para receber mensagens
- [x] Implementar serviço de follow-up automático (estrutura criada)
- [x] Criar testes de integração
- [x] Validar fluxo completo end-to-end


## Recurso de Testes de Integração

- [x] Criar página de testes de integração no painel
- [x] Implementar procedimentos tRPC para testar cada serviço
- [x] Adicionar dados de exemplo para testes
- [x] Criar interface para visualizar resultados dos testes
- [x] Adicionar botão "Testar Conexão" para cada integração


## Catálogo de Produtos/Serviços

- [x] Criar modelo de catálogo no banco de dados
- [x] Implementar procedures tRPC para CRUD de produtos
- [x] Criar página de gerenciamento de catálogo
- [x] Implementar importação em massa (CSV/JSON)
- [x] Integrar catálogo com o agente de IA
- [x] Adicionar busca e filtros no catálogo
- [x] Criar testes para o sistema de catálogo
