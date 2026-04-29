export interface IntegrationInput {
  whatsappToken?: string;
  whatsappPhoneId?: string;
  whatsappVerifyToken?: string;
  openaiApiKey?: string;
}

export interface IntegrationFieldValidation {
  valid: boolean;
  message: string;
}

export interface IntegrationValidationResult {
  valid: boolean;
  sanitized: IntegrationInput;
  fieldErrors: Partial<Record<keyof IntegrationInput, string>>;
  fieldStatus: Partial<Record<keyof IntegrationInput, IntegrationFieldValidation>>;
}

export interface IntegrationCredentialTestResult {
  success: boolean;
  service: string;
  message: string;
  details?: Record<string, unknown>;
  error?: string;
}

function cleanValue(value?: string): string | undefined {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

export function sanitizeIntegrationInput(input: IntegrationInput): IntegrationInput {
  const sanitized: IntegrationInput = {
    whatsappToken: cleanValue(input.whatsappToken),
    whatsappPhoneId: cleanValue(input.whatsappPhoneId),
    whatsappVerifyToken: cleanValue(input.whatsappVerifyToken),
    openaiApiKey: cleanValue(input.openaiApiKey),
  };

  return sanitized;
}

export function validateIntegrationInput(input: IntegrationInput): IntegrationValidationResult {
  const sanitized = sanitizeIntegrationInput(input);
  const fieldErrors: Partial<Record<keyof IntegrationInput, string>> = {};
  const fieldStatus: Partial<Record<keyof IntegrationInput, IntegrationFieldValidation>> = {};

  const hasWhatsAppValue = Boolean(
    sanitized.whatsappToken || sanitized.whatsappPhoneId || sanitized.whatsappVerifyToken
  );

  if (hasWhatsAppValue) {
    if (!sanitized.whatsappToken) {
      fieldErrors.whatsappToken = "Informe o token de acesso do WhatsApp.";
    } else if (sanitized.whatsappToken.length < 20) {
      fieldErrors.whatsappToken = "O token do WhatsApp parece curto demais.";
    }

    if (!sanitized.whatsappPhoneId) {
      fieldErrors.whatsappPhoneId = "Informe o ID do número de telefone do WhatsApp.";
    } else if (!/^\d{6,20}$/.test(sanitized.whatsappPhoneId)) {
      fieldErrors.whatsappPhoneId = "O ID do número do WhatsApp deve conter apenas dígitos.";
    }

    if (!sanitized.whatsappVerifyToken) {
      fieldErrors.whatsappVerifyToken = "Informe o token de verificação do webhook.";
    } else if (sanitized.whatsappVerifyToken.length < 6) {
      fieldErrors.whatsappVerifyToken = "O token de verificação parece curto demais.";
    }
  }

  if (sanitized.openaiApiKey) {
    if (sanitized.openaiApiKey.length < 20) {
      fieldErrors.openaiApiKey = "A chave da OpenAI parece inválida ou incompleta.";
    }
  }

  const fieldNames: Array<keyof IntegrationInput> = [
    "whatsappToken",
    "whatsappPhoneId",
    "whatsappVerifyToken",
    "openaiApiKey",
  ];

  for (const field of fieldNames) {
    if (fieldErrors[field]) {
      fieldStatus[field] = {
        valid: false,
        message: fieldErrors[field]!,
      };
    } else if (sanitized[field]) {
      fieldStatus[field] = {
        valid: true,
        message: "Campo preenchido e validado no formato esperado.",
      };
    }
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    sanitized,
    fieldErrors,
    fieldStatus,
  };
}

export async function testOpenAICredentials(
  openaiApiKey?: string
): Promise<IntegrationCredentialTestResult> {
  if (!openaiApiKey) {
    return {
      success: false,
      service: "OpenAI",
      message: "Chave da OpenAI não informada.",
      error: "Chave da OpenAI não informada.",
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        success: false,
        service: "OpenAI",
        message: response.status === 401 ? "Chave da OpenAI inválida." : "Falha ao validar a chave da OpenAI.",
        error: body || `HTTP ${response.status}`,
      };
    }

    const payload = (await response.json()) as { data?: Array<{ id: string }> };
    const models = (payload.data || []).slice(0, 5).map(model => model.id);

    return {
      success: true,
      service: "OpenAI",
      message: "Chave da OpenAI validada com sucesso.",
      details: {
        models,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      service: "OpenAI",
      message: "Erro ao validar a chave da OpenAI.",
      error: error.message || "Erro desconhecido",
    };
  }
}

export async function testWhatsAppCredentials(
  whatsappToken?: string,
  whatsappPhoneId?: string
): Promise<IntegrationCredentialTestResult> {
  if (!whatsappToken || !whatsappPhoneId) {
    return {
      success: false,
      service: "WhatsApp",
      message: "Token e ID do número do WhatsApp são obrigatórios para o teste.",
      error: "Credenciais incompletas do WhatsApp.",
    };
  }

  try {
    const url = new URL(`https://graph.facebook.com/v19.0/${whatsappPhoneId}`);
    url.searchParams.set("fields", "id,display_phone_number,verified_name");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${whatsappToken}`,
      },
    });

    const rawBody = await response.text();
    const payload = rawBody ? JSON.parse(rawBody) : {};

    if (!response.ok) {
      const errorMessage = payload?.error?.message || `HTTP ${response.status}`;
      return {
        success: false,
        service: "WhatsApp",
        message: response.status === 401 || response.status === 403
          ? "Credenciais do WhatsApp inválidas ou sem permissão."
          : "Falha ao validar credenciais do WhatsApp.",
        error: errorMessage,
      };
    }

    return {
      success: true,
      service: "WhatsApp",
      message: "Credenciais do WhatsApp validadas com sucesso.",
      details: {
        phoneId: payload.id,
        displayPhoneNumber: payload.display_phone_number,
        verifiedName: payload.verified_name,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      service: "WhatsApp",
      message: "Erro ao validar credenciais do WhatsApp.",
      error: error.message || "Erro desconhecido",
    };
  }
}
