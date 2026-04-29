import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MagicAds() {
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);

  // Carregar configurações ao montar o componente
  const { data: configData, isLoading: isLoadingConfig } = trpc.magicads.getConfig.useQuery();

  useEffect(() => {
    if (configData?.config) {
      setConfig(configData.config);
      setApiKey(configData.config.apiKey || "");
      setWebhookUrl(configData.config.webhookUrl || "");
    }
    setIsLoading(false);
  }, [configData]);

  useEffect(() => {
    setIsLoading(isLoadingConfig);
  }, [isLoadingConfig]);

  const saveMutation = trpc.magicads.saveConfig.useMutation({
    onSuccess: (result: any) => {
      if (result.config) {
        setConfig(result.config);
      }
      toast.success("Configuração salva com sucesso!");
      setIsSaving(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar configuração");
      setIsSaving(false);
    },
  });

  const testMutation = trpc.magicads.testWebhook.useMutation({
    onSuccess: (result: any) => {
      setTestResult({ success: true, message: result.message });
      toast.success("Webhook testado com sucesso!");
      setIsTestingWebhook(false);
    },
    onError: (error: any) => {
      setTestResult({ success: false, message: error.message });
      toast.error("Erro ao testar webhook");
      setIsTestingWebhook(false);
    },
  });

  const handleSaveConfig = () => {
    if (!apiKey.trim()) {
      toast.error("API Key é obrigatória");
      return;
    }

    setIsSaving(true);
    saveMutation.mutate({
      apiKey,
      webhookUrl,
    });
  };

  const handleTestWebhook = () => {
    if (!webhookUrl.trim()) {
      toast.error("URL do webhook é obrigatória");
      return;
    }

    setIsTestingWebhook(true);
    testMutation.mutate({
      webhookUrl,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const webhookEndpoint = `${window.location.origin}/api/trpc/magicads.receiveWebhook`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integração MagicAds</h1>
        <p className="text-muted-foreground mt-2">
          Configure a integração bidirecional com o sistema MagicAds para sincronizar leads e follow-ups
        </p>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da API</CardTitle>
          <CardDescription>
            Configure suas credenciais do MagicAds para habilitar a integração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key do MagicAds *</Label>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Sua API Key do MagicAds"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(apiKey)}
                  disabled={!apiKey}
                >
                  <Copy size={18} />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="webhookUrl">URL do Webhook (Opcional)</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://seu-dominio.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                URL para receber notificações de eventos do MagicAds
              </p>
            </div>

            <Button
              onClick={handleSaveConfig}
              disabled={isSaving || !apiKey.trim()}
              className="w-full"
            >
              {isSaving && <Loader2 className="mr-2 animate-spin" size={18} />}
              Salvar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoint do Webhook</CardTitle>
          <CardDescription>
            Configure este endpoint no painel do MagicAds para receber leads em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>URL do Webhook</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="text"
                value={webhookEndpoint}
                readOnly
                className="bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhookEndpoint)}
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>

          <div>
            <Label>Método HTTP</Label>
            <Badge variant="secondary" className="mt-2">
              POST
            </Badge>
          </div>

          <div>
            <Label>Headers Obrigatórios</Label>
            <div className="bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
              <div>Content-Type: application/json</div>
              <div>Authorization: Bearer &lt;seu_api_key&gt;</div>
            </div>
          </div>

          <div>
            <Label>Exemplo de Payload</Label>
            <div className="bg-muted p-4 rounded-lg mt-2 text-sm font-mono overflow-x-auto">
              <pre>{`{
  "apiKey": "seu_api_key",
  "lead": {
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "+5511999999999",
    "campaignId": "campaign_123",
    "campaignName": "Campanha de Vendas",
    "metadata": {
      "source": "google_ads"
    }
  }
}`}</pre>
            </div>
          </div>

          <Button
            onClick={handleTestWebhook}
            disabled={isTestingWebhook || !webhookUrl.trim()}
            variant="outline"
            className="w-full"
          >
            {isTestingWebhook && <Loader2 className="mr-2 animate-spin" size={18} />}
            Testar Webhook
          </Button>

          {testResult && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                testResult.success
                  ? "bg-green-50 text-green-900"
                  : "bg-red-50 text-red-900"
              }`}
            >
              {testResult.success ? (
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">
                  {testResult.success ? "Sucesso" : "Erro"}
                </p>
                <p className="text-sm">{testResult.message}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status de Sincronização</CardTitle>
          <CardDescription>
            Informações sobre a sincronização de leads e follow-ups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Leads Recebidos</span>
                <Badge variant="outline">{config?.leadsReceived || 0}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total de leads sincronizados do MagicAds
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Follow-ups Enviados</span>
                <Badge variant="outline">{config?.followUpsSent || 0}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total de atualizações enviadas ao MagicAds
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última Sincronização</span>
                <Badge variant="outline">
                  {config?.lastSyncAt
                    ? new Date(config.lastSyncAt).toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Nunca"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Data da última sincronização bem-sucedida
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={config?.isActive ? "default" : "secondary"}>
                  {config?.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Status da integração com MagicAds
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Documentação</CardTitle>
          <CardDescription>
            Informações adicionais sobre a integração MagicAds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Fluxo de Sincronização</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>MagicAds envia um novo lead via webhook</li>
              <li>MagicFlow recebe e valida o lead</li>
              <li>Lead é criado no banco de dados</li>
              <li>Processamento automático com IA (se configurado)</li>
              <li>Atualizações são sincronizadas de volta ao MagicAds</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium mb-2">Campos Suportados</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>name (obrigatório)</li>
              <li>email (opcional)</li>
              <li>phone (obrigatório)</li>
              <li>campaignId (opcional)</li>
              <li>campaignName (opcional)</li>
              <li>metadata (opcional - dados customizados)</li>
            </ul>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Ver Guia Completo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Guia de Integração MagicAds</DialogTitle>
                <DialogDescription>
                  Documentação completa para configurar a integração
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">1. Autenticação</h4>
                  <p className="text-muted-foreground">
                    Todos os requests devem incluir a API Key no header Authorization.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Recebimento de Leads</h4>
                  <p className="text-muted-foreground">
                    Quando um novo lead é gerado no MagicAds, ele é enviado automaticamente via webhook.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Processamento com IA</h4>
                  <p className="text-muted-foreground">
                    O sistema pode processar mensagens automaticamente usando OpenAI (se configurado).
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">4. Follow-up Automático</h4>
                  <p className="text-muted-foreground">
                    Follow-ups são agendados automaticamente e sincronizados de volta ao MagicAds.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
