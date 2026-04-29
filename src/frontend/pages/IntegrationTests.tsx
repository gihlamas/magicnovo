import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2, MessageSquareText, RefreshCw, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TestResult = {
  success: boolean;
  service: string;
  message: string;
  duration: number;
  details?: Record<string, unknown>;
  error?: string;
};

type FormData = {
  whatsappToken: string;
  whatsappPhoneId: string;
  whatsappVerifyToken: string;
  openaiApiKey: string;
};

const emptyForm: FormData = {
  whatsappToken: "",
  whatsappPhoneId: "",
  whatsappVerifyToken: "",
  openaiApiKey: "",
};

export default function IntegrationTests() {
  const { data: savedIntegrations } = trpc.integrations.get.useQuery();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  useEffect(() => {
    if (savedIntegrations) {
      setFormData({
        whatsappToken: savedIntegrations.whatsappToken || "",
        whatsappPhoneId: savedIntegrations.whatsappPhoneId || "",
        whatsappVerifyToken: savedIntegrations.whatsappVerifyToken || "",
        openaiApiKey: savedIntegrations.openaiApiKey || "",
      });
    }
  }, [savedIntegrations]);

  const testOpenAI = trpc.integrationTests.testOpenAI.useQuery(
    { openaiApiKey: formData.openaiApiKey || undefined },
    { enabled: false, retry: false }
  );

  const testLeadClass = trpc.integrationTests.testLeadClassification.useQuery(
    { openaiApiKey: formData.openaiApiKey || undefined },
    { enabled: false, retry: false }
  );

  const testWhatsApp = trpc.integrationTests.testWhatsApp.useQuery(
    {
      whatsappToken: formData.whatsappToken || undefined,
      whatsappPhoneId: formData.whatsappPhoneId || undefined,
      whatsappVerifyToken: formData.whatsappVerifyToken || undefined,
    },
    { enabled: false, retry: false }
  );

  const runAllTests = trpc.integrationTests.runAll.useQuery(
    {
      whatsappToken: formData.whatsappToken || undefined,
      whatsappPhoneId: formData.whatsappPhoneId || undefined,
      whatsappVerifyToken: formData.whatsappVerifyToken || undefined,
      openaiApiKey: formData.openaiApiKey || undefined,
    },
    { enabled: false, retry: false }
  );

  const getSampleData = trpc.integrationTests.getSampleData.useQuery(undefined, {
    enabled: false,
    retry: false,
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const runSingleTest = async (
    refetch: () => Promise<{ data?: TestResult }>,
    append = false
  ) => {
    setLoading(true);
    try {
      const result = await refetch();
      if (result.data) {
        setResults((prev) => (append ? [...prev, result.data!] : [result.data!]));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRunAll = async () => {
    setLoading(true);
    try {
      const result = await runAllTests.refetch();
      if (result.data) {
        setResults(result.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetSampleData = async () => {
    const result = await getSampleData.refetch();
    if (result.data) {
      console.log("Sample Data:", result.data);
      alert("Dados de exemplo carregados. Verifique o console para detalhes.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Testes de Integração</h1>
        <p className="text-muted-foreground mt-2">
          Execute verificações reais das credenciais informadas ou reutilize as credenciais já salvas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5" />
            Credenciais para teste
          </CardTitle>
          <CardDescription>
            Se os campos estiverem vazios, o backend tentará usar as credenciais já armazenadas para o usuário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Token do WhatsApp</label>
              <Input
                type="password"
                placeholder="Token da Meta Cloud API"
                value={formData.whatsappToken}
                onChange={(e) => handleInputChange("whatsappToken", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone ID do WhatsApp</label>
              <Input
                placeholder="Ex: 1234567890"
                value={formData.whatsappPhoneId}
                onChange={(e) => handleInputChange("whatsappPhoneId", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Verify Token do WhatsApp</label>
              <Input
                type="password"
                placeholder="Token do webhook"
                value={formData.whatsappVerifyToken}
                onChange={(e) => handleInputChange("whatsappVerifyToken", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Chave da OpenAI</label>
              <Input
                type="password"
                placeholder="sk-..."
                value={formData.openaiApiKey}
                onChange={(e) => handleInputChange("openaiApiKey", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => runSingleTest(() => testWhatsApp.refetch())} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
              Testar WhatsApp
            </Button>

            <Button onClick={() => runSingleTest(() => testOpenAI.refetch())} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
              Testar OpenAI
            </Button>

            <Button onClick={() => runSingleTest(() => testLeadClass.refetch())} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
              Testar Classificação
            </Button>

            <Button onClick={handleRunAll} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Executar todos
            </Button>

            <Button onClick={handleGetSampleData} disabled={loading} variant="secondary">
              Ver dados de exemplo
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos testes</CardTitle>
            <CardDescription>
              {results.filter((r) => r.success).length} de {results.length} verificações foram concluídas com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, idx) => (
              <div
                key={`${result.service}-${idx}`}
                className={`border rounded-lg p-4 ${
                  result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">{result.service}</h3>
                      <p className="text-xs text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>{result.duration}ms</Badge>
                </div>

                {result.details && (
                  <div className="bg-white rounded p-3 text-xs space-y-2 mb-3">
                    {Object.entries(result.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4">
                        <span className="font-medium text-gray-600">{key}:</span>
                        <span className="text-gray-900 text-right break-all">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {result.error && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          Execute primeiro os testes de credenciais. Em seguida, rode a suíte completa para confirmar se o ambiente está pronto para webhook e IA.
        </AlertDescription>
      </Alert>
    </div>
  );
}
