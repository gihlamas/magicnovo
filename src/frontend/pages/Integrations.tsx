import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useMemo, useState } from "react";
import { Save, AlertCircle, CheckCircle, Loader2, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

type IntegrationFormData = {
  whatsappToken: string;
  whatsappPhoneId: string;
  whatsappVerifyToken: string;
  openaiApiKey: string;
};

type ValidationResponse = {
  valid: boolean;
  fieldErrors: Partial<Record<keyof IntegrationFormData, string>>;
  fieldStatus: Partial<Record<keyof IntegrationFormData, { valid: boolean; message: string }>>;
};

type TestResult = {
  success: boolean;
  service: string;
  message: string;
  duration: number;
  details?: Record<string, unknown>;
  error?: string;
};

const emptyForm: IntegrationFormData = {
  whatsappToken: "",
  whatsappPhoneId: "",
  whatsappVerifyToken: "",
  openaiApiKey: "",
};

export default function Integrations() {
  const { data: integrations } = trpc.integrations.get.useQuery();
  const upsertMutation = trpc.integrations.upsert.useMutation();

  const [isSaving, setIsSaving] = useState(false);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [formData, setFormData] = useState<IntegrationFormData>(emptyForm);

  useEffect(() => {
    if (integrations) {
      setFormData({
        whatsappToken: integrations.whatsappToken || "",
        whatsappPhoneId: integrations.whatsappPhoneId || "",
        whatsappVerifyToken: integrations.whatsappVerifyToken || "",
        openaiApiKey: integrations.openaiApiKey || "",
      });
    }
  }, [integrations]);

  const validateQuery = trpc.integrations.validate.useQuery(formData, {
    enabled: false,
    retry: false,
  });

  const testWhatsAppQuery = trpc.integrationTests.testWhatsApp.useQuery(
    {
      whatsappToken: formData.whatsappToken || undefined,
      whatsappPhoneId: formData.whatsappPhoneId || undefined,
      whatsappVerifyToken: formData.whatsappVerifyToken || undefined,
    },
    { enabled: false, retry: false }
  );

  const testOpenAIQuery = trpc.integrationTests.testOpenAI.useQuery(
    { openaiApiKey: formData.openaiApiKey || undefined },
    { enabled: false, retry: false }
  );

  const statusSummary = useMemo(() => {
    return {
      whatsapp:
        testResults.WhatsApp?.success ??
        Boolean(formData.whatsappToken && formData.whatsappPhoneId && formData.whatsappVerifyToken),
      openai: testResults.OpenAI?.success ?? Boolean(formData.openaiApiKey),
    };
  }, [formData, testResults]);

  const handleInputChange = (field: keyof IntegrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validation) {
      setValidation({
        ...validation,
        fieldErrors: {
          ...validation.fieldErrors,
          [field]: undefined,
        },
      });
    }
  };

  const handleValidate = async () => {
    const result = await validateQuery.refetch();
    if (result.data) {
      setValidation(result.data as ValidationResponse);
      if (result.data.valid) {
        toast.success("Campos validados com sucesso.");
      } else {
        toast.error("Existem campos que precisam ser corrigidos antes de salvar.");
      }
    }
    return result.data as ValidationResponse | undefined;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const validationResult = await handleValidate();

      if (!validationResult?.valid) {
        return;
      }

      await upsertMutation.mutateAsync(formData);
      toast.success("Integrações salvas com sucesso.");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar integrações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTest = async (service: "WhatsApp" | "OpenAI") => {
    setActiveTest(service);
    try {
      const response =
        service === "WhatsApp"
          ? await testWhatsAppQuery.refetch()
          : await testOpenAIQuery.refetch();

      if (response.data) {
        setTestResults((prev) => ({ ...prev, [response.data.service]: response.data }));
        if (response.data.success) {
          toast.success(`${response.data.service} validado com sucesso.`);
        } else {
          toast.error(response.data.error || response.data.message);
        }
      }
    } finally {
      setActiveTest(null);
    }
  };

  const getFieldError = (field: keyof IntegrationFormData) => validation?.fieldErrors?.[field];

  const renderFieldMessage = (field: keyof IntegrationFormData) => {
    const error = getFieldError(field);
    if (!error) return null;
    return <p className="text-xs text-red-600 mt-1">{error}</p>;
  };

  const renderTestCard = (service: string) => {
    const result = testResults[service];
    if (!result) return null;

    return (
      <div
        className={`mt-4 rounded-lg border p-3 ${
          result.success ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{result.service}</p>
            <p className="text-sm text-slate-700 mt-1">{result.message}</p>
            {result.error && <p className="text-xs text-red-700 mt-2">{result.error}</p>}
          </div>
          <span className="text-xs text-slate-500 whitespace-nowrap">{result.duration}ms</span>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Integrações</h1>
          <p className="text-slate-600 mt-2">
            Configure, valide e teste suas credenciais de integração com serviços externos.
          </p>
        </div>

        <Card className="p-4 bg-amber-50 border border-amber-200 flex gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-amber-900">Segurança</p>
            <p className="text-sm text-amber-800 mt-1">
              Valide as credenciais antes de salvar. Isso reduz erros de webhook e IA.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">W</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">WhatsApp (Meta Cloud API)</h2>
                <p className="text-sm text-slate-600">Conecte seu número para receber e responder mensagens.</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleRunTest("WhatsApp")}
              disabled={activeTest !== null}
            >
              {activeTest === "WhatsApp" ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Zap size={16} className="mr-2" />}
              Testar conexão
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Token de Acesso</Label>
              <Input
                type="password"
                placeholder="Seu token de acesso da Meta"
                value={formData.whatsappToken}
                onChange={(e) => handleInputChange("whatsappToken", e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">Meta App Dashboard → WhatsApp → API Setup</p>
              {renderFieldMessage("whatsappToken")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">ID do Número de Telefone</Label>
                <Input
                  placeholder="Ex: 1234567890"
                  value={formData.whatsappPhoneId}
                  onChange={(e) => handleInputChange("whatsappPhoneId", e.target.value)}
                  className="mt-2"
                />
                {renderFieldMessage("whatsappPhoneId")}
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Token de Verificação</Label>
                <Input
                  type="password"
                  placeholder="Seu token de verificação"
                  value={formData.whatsappVerifyToken}
                  onChange={(e) => handleInputChange("whatsappVerifyToken", e.target.value)}
                  className="mt-2"
                />
                {renderFieldMessage("whatsappVerifyToken")}
              </div>
            </div>
          </div>

          {renderTestCard("WhatsApp")}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">O</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">OpenAI</h2>
                <p className="text-sm text-slate-600">Valide sua chave antes de usar o agente de IA.</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleRunTest("OpenAI")}
              disabled={activeTest !== null}
            >
              {activeTest === "OpenAI" ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Zap size={16} className="mr-2" />}
              Testar conexão
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Chave de API (OpenAI)</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={formData.openaiApiKey}
                onChange={(e) => handleInputChange("openaiApiKey", e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">OpenAI Dashboard → API Keys</p>
              {renderFieldMessage("openaiApiKey")}
            </div>
          </div>

          {renderTestCard("OpenAI")}
        </Card>

        <div className="flex flex-col md:flex-row gap-6">
          <Card className="p-6 flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={20} />
              Resumo de Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700">WhatsApp</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusSummary.whatsapp ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="text-xs text-slate-600">{statusSummary.whatsapp ? "Pronto para uso" : "Pendente"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700">OpenAI</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusSummary.openai ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="text-xs text-slate-600">{statusSummary.openai ? "Pronto para uso" : "Pendente"}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3 justify-end">
            <Button
              variant="outline"
              size="lg"
              onClick={handleValidate}
              disabled={isSaving || activeTest !== null}
            >
              Validar Campos
            </Button>
            <Button
              size="lg"
              onClick={handleSave}
              disabled={isSaving || activeTest !== null}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
