import {
  IntegrationInput,
  testOpenAICredentials,
  testWhatsAppCredentials,
  validateIntegrationInput,
} from "./integration-validation.service";

export interface IntegrationTestResult {
  success: boolean;
  service: string;
  message: string;
  duration: number;
  details?: any;
  error?: string;
}

export interface IntegrationTestRunInput extends IntegrationInput {}

/**
 * Dados de exemplo para testes
 */
export const SAMPLE_DATA = {
  messages: [
    {
      text: "Olá! Gostaria de saber mais sobre seus serviços de consultoria",
      expectedIntent: "informacao",
    },
    {
      text: "Perfeito! Quero agendar uma consulta para terça-feira às 14:30",
      expectedIntent: "agendamento",
    },
  ],
  leads: [
    {
      name: "João Silva",
      phone: "5511999998888",
      service: "Consultoria de TI",
      notes: "Lead de teste - Consultoria",
    },
  ],
};

async function withDuration(
  service: string,
  operation: () => Promise<Omit<IntegrationTestResult, "duration" | "service">>
): Promise<IntegrationTestResult> {
  const startTime = Date.now();

  try {
    const result = await operation();
    return {
      service,
      duration: Date.now() - startTime,
      ...result,
    };
  } catch (error: any) {
    return {
      success: false,
      service,
      duration: Date.now() - startTime,
      message: `Falha ao executar teste de ${service}`,
      error: error.message || "Erro desconhecido",
    };
  }
}

export async function testOpenAIService(openaiApiKey?: string): Promise<IntegrationTestResult> {
  return withDuration("OpenAI", async () => {
    const result = await testOpenAICredentials(openaiApiKey);
    return {
      success: result.success,
      message: result.message,
      details: result.details,
      error: result.error,
    };
  });
}

export async function testLeadClassification(openaiApiKey?: string): Promise<IntegrationTestResult> {
  return withDuration("Lead Classification", async () => {
    const validation = validateIntegrationInput({ openaiApiKey });

    if (validation.fieldErrors.openaiApiKey) {
      return {
        success: false,
        message: "A chave da OpenAI precisa ser validada antes do teste de classificação.",
        error: validation.fieldErrors.openaiApiKey,
      };
    }

    const result = await testOpenAICredentials(openaiApiKey);

    if (!result.success) {
      return {
        success: false,
        message: "Não foi possível validar a OpenAI para o teste de classificação.",
        error: result.error || result.message,
      };
    }

    return {
      success: true,
      message: "A integração da OpenAI está apta para classificação de leads.",
      details: {
        sampleMessage: SAMPLE_DATA.messages[1].text,
        expectedFlow: "agendamento",
        validation: "credencial aceita e pronta para uso nas rotinas de IA",
      },
    };
  });
}

export async function testWhatsAppIntegration(
  whatsappToken?: string,
  whatsappPhoneId?: string,
  whatsappVerifyToken?: string
): Promise<IntegrationTestResult> {
  return withDuration("WhatsApp", async () => {
    const validation = validateIntegrationInput({
      whatsappToken,
      whatsappPhoneId,
      whatsappVerifyToken,
    });

    const firstError =
      validation.fieldErrors.whatsappToken ||
      validation.fieldErrors.whatsappPhoneId ||
      validation.fieldErrors.whatsappVerifyToken;

    if (firstError) {
      return {
        success: false,
        message: "As credenciais do WhatsApp estão incompletas ou inválidas no formato.",
        error: firstError,
      };
    }

    const result = await testWhatsAppCredentials(whatsappToken, whatsappPhoneId);
    return {
      success: result.success,
      message: result.message,
      details: {
        ...result.details,
        verifyTokenConfigured: Boolean(whatsappVerifyToken),
      },
      error: result.error,
    };
  });
}

export async function runAllIntegrationTests(
  input: IntegrationTestRunInput
): Promise<IntegrationTestResult[]> {
  const validation = validateIntegrationInput(input);
  const results: IntegrationTestResult[] = [];

  if (input.openaiApiKey) {
    results.push(await testOpenAIService(validation.sanitized.openaiApiKey));
    results.push(await testLeadClassification(validation.sanitized.openaiApiKey));
  }

  if (input.whatsappToken || input.whatsappPhoneId || input.whatsappVerifyToken) {
    results.push(
      await testWhatsAppIntegration(
        validation.sanitized.whatsappToken,
        validation.sanitized.whatsappPhoneId,
        validation.sanitized.whatsappVerifyToken
      )
    );
  }

  if (results.length === 0) {
    results.push({
      success: false,
      service: "Integration Tests",
      message: "Nenhuma credencial foi informada para teste.",
      duration: 0,
      error: "Preencha ao menos uma integração antes de executar os testes.",
    });
  }

  return results;
}

export function getSampleData() {
  return SAMPLE_DATA;
}
