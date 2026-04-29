import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Calendar, AlertCircle, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { data: metrics, isLoading } = trpc.dashboard.metrics.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const leadsByStatusMap = metrics?.leadsByStatus?.reduce(
    (acc, item) => {
      acc[item.status] = Number(item.count || 0);
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo ao painel administrativo do MagicFlow
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">Contatos em sistema</p>
          </CardContent>
        </Card>

        {/* Today Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.todayAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Reuniões agendadas</p>
          </CardContent>
        </Card>

        {/* Hot Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Quentes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsByStatusMap["quente"] || 0}</div>
            <p className="text-xs text-muted-foreground">Prontos para conversão</p>
          </CardContent>
        </Card>

        {/* Warm Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Mornos</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsByStatusMap["morno"] || 0}</div>
            <p className="text-xs text-muted-foreground">Requerem follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
          <CardDescription>Últimas atividades no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.recentEvents && metrics.recentEvents.length > 0 ? (
              metrics.recentEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm capitalize">{event.type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.phone && `Telefone: ${event.phone}`}
                    </p>
                    {event.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">{event.errorMessage}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        event.status === "success"
                          ? "bg-green-100 text-green-800"
                          : event.status === "error"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {event.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(event.createdAt).toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum evento registrado</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Leads por Status</CardTitle>
          <CardDescription>Classificação dos contatos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(leadsByStatusMap).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === "frio"
                        ? "bg-blue-500"
                        : status === "morno"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm font-medium capitalize">{status}</span>
                </div>
                <span className="text-sm font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
