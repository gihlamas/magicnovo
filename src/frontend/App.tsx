import React, { useState } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Zap, Users, Calendar, AlertCircle, Link2, 
  Menu, X, LogOut, Save, Loader2, CheckCircle, RefreshCw, 
  MessageSquareText, ShieldCheck, Copy, Eye, EyeOff, TrendingUp,
  Clock, Phone, ChevronRight, MoreHorizontal, Filter, Search
} from "lucide-react";

// --- Modern UI Components ---
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden transition-all hover:shadow-md ${className}`}>{children}</div>
);

const Button = ({ children, onClick, disabled, variant = "primary", className = "", size = "md" }: any) => {
  const base = "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  const variants: any = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  const sizes: any = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2.5"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ ...props }: any) => (
  <div className="relative">
    <input {...props} className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 ${props.className || ""}`} />
  </div>
);

const Label = ({ children, className = "" }: any) => (
  <label className={`block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 ${className}`}>{children}</label>
);

const Badge = ({ children, variant = "default" }: any) => {
  const variants: any = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    destructive: "bg-rose-50 text-rose-700 border border-rose-100",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-100"
  };
  return <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-tight ${variants[variant]}`}>{children}</span>;
};

// --- Refined Pages ---

const Dashboard = () => (
  <div className="p-8 space-y-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Bem-vindo de volta! Aqui está o resumo do seu sistema.</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm"><Clock size={14} className="mr-2" /> Últimos 7 dias</Button>
        <Button size="sm"><TrendingUp size={14} className="mr-2" /> Ver Relatórios</Button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Users size={80} className="text-indigo-600" />
        </div>
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total de Leads</p>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-4xl font-black text-slate-900">124</p>
          <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-1.5 py-0.5 rounded">+12%</span>
        </div>
        <div className="mt-6 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 w-[65%]"></div>
        </div>
      </Card>

      <Card className="p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Calendar size={80} className="text-emerald-600" />
        </div>
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Agendamentos Hoje</p>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-4xl font-black text-slate-900">08</p>
          <span className="text-slate-400 text-xs font-medium">Meta: 10</span>
        </div>
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Próximo: João Silva às 14:30
        </div>
      </Card>

      <Card className="p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <MessageSquareText size={80} className="text-amber-600" />
        </div>
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Conversas Ativas</p>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-4xl font-black text-slate-900">42</p>
          <span className="text-amber-600 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded">Alta demanda</span>
        </div>
        <p className="mt-6 text-xs text-slate-400 font-medium">Tempo médio de resposta: 2m 15s</p>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-4">Atividade Recente</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><Zap size={18} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Novo lead qualificado</p>
                <p className="text-xs text-slate-500">Maria Oliveira entrou via MagicAds</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">15m atrás</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-4">Status das Integrações</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white"><Phone size={16} /></div>
              <span className="text-sm font-bold text-slate-700">WhatsApp API</span>
            </div>
            <Badge variant="success">Online</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white"><Zap size={16} /></div>
              <span className="text-sm font-bold text-slate-700">OpenAI GPT-4</span>
            </div>
            <Badge variant="success">Online</Badge>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

const Leads = () => {
  const leads = [
    { id: 1, name: "João Silva", phone: "+55 11 99999-9999", status: "quente", stage: "qualificado", service: "Consultoria", last: "2h atrás" },
    { id: 2, name: "Maria Oliveira", phone: "+55 21 98888-8888", status: "morno", stage: "novo", service: "Mentoria", last: "5h atrás" },
    { id: 3, name: "Pedro Santos", phone: "+55 31 97777-7777", status: "frio", stage: "perdido", service: "Curso Online", last: "1d atrás" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestão de Leads</h1>
          <p className="text-slate-500 mt-1">Gerencie seu funil de vendas com inteligência.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter size={16} className="mr-2" /> Filtros</Button>
          <Button className="bg-indigo-600">+ Novo Lead</Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input placeholder="Buscar por nome, telefone ou e-mail..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lead</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Etapa</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Serviço</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Última</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">{lead.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-400">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={lead.status === "quente" ? "success" : lead.status === "morno" ? "warning" : "destructive"}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{lead.stage}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{lead.service}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">{lead.last}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><MoreHorizontal size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const Appointments = () => {
  const appointments = [
    { id: 1, title: "Consultoria Estratégica", lead: "João Silva", date: "22 Abr", time: "14:30", status: "agendado", type: "Vídeo Chamada" },
    { id: 2, title: "Mentoria Individual", lead: "Maria Oliveira", date: "23 Abr", time: "10:00", status: "pendente", type: "Presencial" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Agendamentos</h1>
          <p className="text-slate-500 mt-1">Sua agenda organizada e sincronizada.</p>
        </div>
        <Button className="bg-indigo-600 shadow-lg shadow-indigo-200">+ Novo Horário</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appointments.map((app) => (
          <Card key={app.id} className="p-0 border-none shadow-md shadow-slate-200/50">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={app.status === "agendado" ? "success" : "warning"}>{app.status}</Badge>
                <div className="text-right">
                  <p className="text-lg font-black text-indigo-600">{app.time}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.date}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{app.title}</h3>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Users size={16} className="text-slate-400" /> {app.lead}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Zap size={16} className="text-slate-400" /> {app.type}
                </div>
              </div>
            </div>
            <div className="bg-slate-50/80 p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 text-xs py-2">Reagendar</Button>
              <Button variant="primary" className="flex-1 text-xs py-2">Confirmar</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Integrations = () => {
  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Integrações</h1>
        <p className="text-slate-500 mt-1">Conecte o MagicFlow aos seus serviços favoritos.</p>
      </div>

      <div className="bg-indigo-600 rounded-2xl p-6 text-white flex items-center gap-6 shadow-xl shadow-indigo-100">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md"><ShieldCheck size={32} /></div>
        <div>
          <h3 className="text-lg font-bold">Segurança de Dados</h3>
          <p className="text-indigo-100 text-sm opacity-90">Suas chaves de API são criptografadas e nunca compartilhadas.</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100"><Phone size={24} /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">WhatsApp Business</h2>
                <p className="text-sm text-slate-400">Meta Cloud API Integration</p>
              </div>
            </div>
            <Badge variant="success">Conectado</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label>Access Token</Label>
              <Input type="password" value="••••••••••••••••••••••••••••••" readOnly />
            </div>
            <div>
              <Label>Phone Number ID</Label>
              <Input value="10928374655" readOnly />
            </div>
            <div>
              <Label>Verify Token</Label>
              <Input type="password" value="••••••••" readOnly />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <Button variant="outline" size="sm">Editar Configurações</Button>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><Zap size={24} /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">OpenAI Intelligence</h2>
                <p className="text-sm text-slate-400">GPT-4 Turbo Engine</p>
              </div>
            </div>
            <Badge variant="success">Ativo</Badge>
          </div>
          <div>
            <Label>API Key</Label>
            <Input type="password" value="••••••••••••••••••••••••••••••" readOnly />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <Button variant="outline" size="sm">Alterar Modelo</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const MagicAds = () => {
  const [showKey, setShowKey] = useState(false);
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">MagicAds</h1>
        <p className="text-slate-500 mt-1">Sincronização inteligente de leads em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100"><Link2 size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Configuração de Sincronização</h2>
              <p className="text-sm text-slate-400">Conecte sua conta MagicAds para importar leads.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label>API Key do MagicAds</Label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input type={showKey ? "text" : "password"} value="ma_live_51PjK82Lp0X92M" readOnly />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Button variant="outline" size="icon"><Copy size={18} /></Button>
              </div>
            </div>
            <div>
              <Label>Webhook Endpoint</Label>
              <div className="flex gap-3">
                <Input value="https://magicflow.app/api/v1/webhook/magicads" readOnly className="bg-slate-100 text-slate-500" />
                <Button variant="outline" size="icon"><Copy size={18} /></Button>
              </div>
            </div>
            <div className="pt-4">
              <Button className="w-full py-4 text-base">Atualizar Integração</Button>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-indigo-900 text-white border-none shadow-xl shadow-indigo-200">
            <h3 className="font-bold text-indigo-200 uppercase text-[10px] tracking-widest mb-4">Status da Conta</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-indigo-300">Plano Atual</p>
                  <p className="text-lg font-bold">Enterprise</p>
                </div>
                <Badge variant="indigo" className="bg-white/10 border-white/20 text-white">Ativo</Badge>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-indigo-300 mb-1">Uso de Leads (Mês)</p>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[42%]"></div>
                </div>
                <p className="text-[10px] mt-2 text-right text-indigo-200 font-bold">420 / 1000</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Logs de Sincronização</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Lead sincronizado</p>
                    <p className="text-[10px] text-slate-400">ID: #8293 - 12:45</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const IntegrationTests = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runTests = () => {
    setLoading(true);
    setResults([]);
    setTimeout(() => {
      setResults([
        { service: "WhatsApp API", success: true, message: "Conexão estabelecida com sucesso", duration: 450 },
        { service: "OpenAI GPT-4", success: true, message: "IA respondendo corretamente", duration: 1200 },
        { service: "Webhook Receiver", success: false, message: "URL de retorno não configurada", duration: 150 }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Testes de Sistema</h1>
        <p className="text-gray-500 mt-1">Valide se todas as integrações estão operando corretamente.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="text-indigo-600" /> Diagnóstico Completo</h2>
          <Button onClick={runTests} disabled={loading} className="bg-indigo-600">
            {loading ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Zap className="mr-2" size={18} />}
            Executar Todos os Testes
          </Button>
        </div>

        <div className="space-y-3">
          {results.length === 0 && !loading && (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-gray-400">Nenhum teste executado recentemente.</p>
            </div>
          )}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto text-indigo-600 mb-2" size={32} />
              <p className="text-gray-500">Testando conexões...</p>
            </div>
          )}
          {results.map((res, i) => (
            <div key={i} className={`p-4 rounded-lg border flex items-center justify-between ${res.success ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
              <div className="flex items-center gap-3">
                {res.success ? <CheckCircle className="text-green-600" /> : <AlertCircle className="text-red-600" />}
                <div>
                  <p className="font-bold text-sm text-gray-900">{res.service}</p>
                  <p className="text-xs text-gray-600">{res.message}</p>
                </div>
              </div>
              <Badge variant="outline">{res.duration}ms</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// --- Main Layout ---
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Users, label: "Leads", path: "/leads" },
    { icon: Calendar, label: "Agendamentos", path: "/appointments" },
    { icon: Zap, label: "Integrações", path: "/integrations" },
    { icon: AlertCircle, label: "Testes", path: "/tests" },
    { icon: Link2, label: "MagicAds", path: "/magicads" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-all" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Zap size={22} fill="currentColor" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">MagicFlow</span>
            </div>
            <button className="md:hidden p-2 text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 mt-2">Menu Principal</p>
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${location === item.path ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                  <item.icon size={20} className={`${location === item.path ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"} transition-colors`} />
                  <span className="font-bold text-sm">{item.label}</span>
                  {location === item.path && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </a>
              </Link>
            ))}
          </nav>

          <div className="p-6 mt-auto border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs">JD</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">John Doe</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Pro</p>
              </div>
              <button className="text-slate-300 hover:text-rose-500 transition-colors"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <button className="md:hidden p-2.5 bg-slate-100 text-slate-600 rounded-xl" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-medium">
            <span>MagicFlow</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 font-bold capitalize">{location === "/" ? "Dashboard" : location.substring(1)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input placeholder="Busca rápida..." className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none w-48 transition-all focus:w-64" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer relative">
              <Zap size={18} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-600 border-2 border-white rounded-full"></span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- Main App ---
function App() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/leads" component={Leads} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/tests" component={IntegrationTests} />
        <Route path="/magicads" component={MagicAds} />
        <Route>
          <div className="p-20 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <AlertCircle size={48} />
            </div>
            <h1 className="text-6xl font-black text-slate-200">404</h1>
            <p className="text-slate-500 font-bold mt-2">Ops! Esta página sumiu no fluxo.</p>
            <Link href="/"><a className="mt-8 inline-block"><Button>Voltar ao Dashboard</Button></a></Link>
          </div>
        </Route>
      </Switch>
    </DashboardLayout>
  );
}

export default App;
