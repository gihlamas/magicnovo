# Guia Técnico de Integração: MagicFlow e MagicAds

Este documento detalha o processo de integração entre o seu MagicFlow e a plataforma MagicAds, permitindo a automação da captação e gestão de leads.

## 1. Visão Geral da Integração

A integração com o MagicAds é projetada para ser bidirecional, garantindo que leads gerados em suas campanhas de marketing sejam automaticamente inseridos no MagicFlow para atendimento e que as atualizações de status desses leads possam ser reportadas de volta ao MagicAds para otimização de campanhas.

### Fluxo de Dados

| Origem | Destino | Tipo de Dados | Mecanismo | Objetivo |
| :--- | :--- | :--- | :--- | :--- |
| MagicAds | Sistema WhatsApp | Novos Leads | Webhook (POST) | Inserção automática de leads para atendimento |
| Sistema WhatsApp | MagicAds | Atualizações de Follow-up | Chamada de API (POST) | Sincronização de status e estágio do lead |

## 2. Configuração do Webhook no MagicAds

Para que o MagicFlow receba leads do MagicAds, você precisará configurar um webhook na plataforma MagicAds apontando para o seu sistema.

### 2.1. Endpoint do Webhook

O endpoint para o qual o MagicAds deve enviar os dados dos leads é:

`POST https://[SEU_DOMINIO]/api/trpc/magicads.receiveWebhook`

Substitua `[SEU_DOMINIO]` pelo domínio público onde seu MagicFlow está hospedado. É crucial que este domínio utilize **HTTPS**.

### 2.2. Autenticação

A segurança do webhook é garantida por uma **API Key**. Esta chave deve ser enviada no corpo da requisição POST do MagicAds. O sistema irá validar esta chave para processar o lead.

Atualmente, a API Key é configurada via variável de ambiente `MAGICADS_API_KEY` no seu servidor. Para fins de desenvolvimento, um valor padrão (`default-key`) pode ser usado, mas em produção, **é altamente recomendável usar uma chave forte e única**.

### 2.3. Estrutura do Payload (JSON)

O MagicAds deve enviar os dados do lead no formato JSON, seguindo o `MagicAdsLeadSchema` definido no sistema. O payload esperado é:

```json
{
  "apiKey": "SUA_API_KEY_DO_SISTEMA",
  "lead": {
    "name": "Nome do Lead",
    "email": "email@exemplo.com",
    "phone": "+5511999999999",
    "source": "magicads",
    "campaignId": "ID_DA_CAMPANHA_MAGICADS",
    "campaignName": "Nome da Campanha no MagicAds",
    "metadata": {
      "utm_source": "google",
      "utm_medium": "cpc"
    }
  }
}
```

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `apiKey` | `string` | Sim | Chave de API para autenticação do webhook. |
| `lead.name` | `string` | Sim | Nome completo do lead. |
| `lead.email` | `string` | Não | Endereço de e-mail do lead. |
| `lead.phone` | `string` | Sim | Número de telefone do lead (formato internacional, ex: `+5511999999999`). |
| `lead.source` | `string` | Não | Origem do lead (padrão: `magicads`). |
| `lead.campaignId` | `string` | Não | ID da campanha no MagicAds que gerou o lead. |
| `lead.campaignName` | `string` | Não | Nome da campanha no MagicAds. |
| `lead.metadata` | `object` | Não | Objeto JSON para metadados adicionais (ex: UTMs, IDs de anúncio). |

## 3. Processamento de Leads no Sistema de WhatsApp

Ao receber um lead via webhook, o sistema executa as seguintes ações:

1.  **Validação**: Os dados do lead são validados contra o `MagicAdsLeadSchema` para garantir integridade e formato correto.
2.  **Criação/Atualização de Lead**: Um novo lead é criado no banco de dados local com o `status` inicial de "frio" e `stage` de "novo". Se o número de telefone já existir, o lead pode ser atualizado (dependendo da lógica de `createLead` no `db.ts`).
3.  **Registro de Evento**: Um evento `lead_created` é registrado no `eventLogs` do sistema, contendo detalhes como `leadId`, `name`, `campaignId` e `source: "magicads"`.
4.  **Início do Atendimento**: O sistema está configurado para que a criação de um novo lead possa disparar automaticamente o processo de atendimento via WhatsApp, utilizando o agente de IA para iniciar a conversa.

## 4. Sincronização de Follow-up (Opcional)

O sistema possui um mecanismo para sincronizar atualizações de follow-up de volta para o MagicAds. Embora a implementação atual em `magicads-integration.ts` apenas registre um evento de log (`followup_sent`), a estrutura está pronta para realizar chamadas HTTP para a API do MagicAds, caso esta funcionalidade seja implementada na plataforma MagicAds.

O endpoint para esta sincronização é:

`POST https://[SEU_DOMINIO_MAGICADS]/api/followup` (Exemplo, o endpoint real dependerá da API do MagicAds)

O payload esperado seria:

```json
{
  "leadId": 123,
  "status": "quente",
  "stage": "agendado",
  "lastInteraction": "2023-10-27T10:00:00Z",
  "nextFollowUp": "2023-10-28T14:00:00Z"
}
```

## 5. Configuração no Painel Administrativo

O painel administrativo do MagicFlow (`MagicAds.tsx`) permite configurar a API Key do MagicAds e visualizar o endpoint do webhook. Embora a funcionalidade de salvar a API Key no banco de dados esteja presente, a validação e o armazenamento seguro em produção devem ser garantidos.

---

**Autor**: Manus AI

**Referências**:
1.  `magicads.ts` - Definição do router tRPC para MagicAds.
2.  `magicads-integration.ts` - Lógica de processamento de leads do MagicAds.
3.  `MagicAds.tsx` - Componente React para configuração da integração no frontend.
4.  `schema.ts` - Definição do esquema do banco de dados para leads e integrações.
