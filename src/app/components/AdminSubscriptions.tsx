import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw, Search, Users, CreditCard, Download, BarChart3, Edit2, X, Save, CheckCircle2, XCircle, Calendar as CalIcon, Loader2 } from 'lucide-react';
import { storeApi } from '../utils/storeApi';
import { toast } from 'sonner@2.0.3';

interface Props { onBack: () => void; }

type Tab = 'dashboard' | 'users' | 'payments';

interface UserRow {
  userId: string;
  email: string;
  name?: string;
  subscriptionStatus: string;
  subscriptionExpiresAt: number | null;
  subscriptionMethod?: string;
  downloadsToday: number;
  totalDownloads: number;
  createdAt?: string | null;
  lastSignInAt?: string | null;
}

const fmtDate = (ts: number | string | null | undefined) => {
  if (!ts) return '—';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const fmtBRL = (n: number) => `R$ ${(n / 1).toFixed(2).replace('.', ',')}`;

export function AdminSubscriptions({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [subModal, setSubModal] = useState<UserRow | null>(null);

  const load = async () => {
    setLoading(true);
    const [s, u, p] = await Promise.all([
      storeApi.adminStats(),
      storeApi.adminListUsers(),
      storeApi.adminPayments(),
    ]);
    if (s?.success) setStats(s.stats);
    if (u?.success) setUsers(u.users || []);
    if (p?.success) setPayments(p.payments || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => (u.email || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q));
  }, [users, search]);

  const handleSetSub = async (status: 'active' | 'inactive', days = 30) => {
    if (!subModal) return;
    const res = await storeApi.adminSetSubscription(subModal.userId, { status, days, method: 'manual' });
    if (res?.success) { toast.success(status === 'active' ? 'Assinatura ativada!' : 'Assinatura cancelada.'); setSubModal(null); load(); }
    else toast.error(res?.error || 'Erro');
  };

  const handleUserSave = async (payload: any) => {
    if (!editingUser) return;
    const res = await storeApi.adminUpdateUser(editingUser.userId, payload);
    if (res?.success) { toast.success('Usuário atualizado.'); setEditingUser(null); load(); }
    else toast.error(res?.error || 'Erro');
  };

  const handleRefreshPayment = async (ref: string) => {
    const res = await storeApi.adminRefreshPayment(ref);
    if (res?.success) { toast.success(`Status: ${res.payment?.status}`); load(); }
    else toast.error(res?.error || 'Erro ao consultar');
  };

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800"><ArrowLeft size={18} /></button>
            <h1 className="text-2xl font-bold">Assinaturas & <span className="text-lime-400">Usuários</span></h1>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-lime-400/50 px-3 py-2 rounded-lg text-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
          </button>
        </div>

        <div className="flex gap-2 border-b border-zinc-800 mb-6 overflow-x-auto">
          {([
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'payments', label: 'Pagamentos', icon: CreditCard },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === t.id ? 'border-lime-400 text-lime-400' : 'border-transparent text-zinc-400 hover:text-white'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <div className="space-y-6">
            {!stats ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-lime-400" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Usuários', value: stats.totalUsers, icon: Users },
                    { label: 'Assinaturas ativas', value: stats.activeSubscriptions, icon: CheckCircle2, accent: 'text-lime-400' },
                    { label: 'Vencendo em 7d', value: stats.expiringSoon, icon: CalIcon, accent: 'text-amber-400' },
                    { label: 'Itens cadastrados', value: stats.totalItems, icon: BarChart3 },
                    { label: 'Downloads totais', value: stats.totalDownloads, icon: Download },
                    { label: 'Downloads (7d)', value: stats.downloadsLast7, icon: Download, accent: 'text-sky-400' },
                    { label: 'Pagamentos OK', value: stats.approvedPayments, icon: CreditCard, accent: 'text-lime-400' },
                    { label: 'Receita aprovada', value: fmtBRL(stats.revenue || 0), icon: CreditCard, accent: 'text-lime-400' },
                  ].map(c => (
                    <div key={c.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2"><c.icon size={14} />{c.label}</div>
                      <div className={`text-2xl font-bold ${c.accent || ''}`}>{c.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <h3 className="font-bold mb-3">Top 5 itens mais baixados</h3>
                  {stats.topItems?.length ? (
                    <ul className="space-y-2">
                      {stats.topItems.map((t: any, i: number) => (
                        <li key={i} className="flex items-center justify-between p-2 rounded bg-zinc-900">
                          <span className="text-sm">{i + 1}. {t.title}</span>
                          <span className="text-xs text-lime-400 font-bold">{t.count} downloads</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-zinc-500">Nenhum download registrado.</p>}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou email..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-lime-400" />
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
                  <tr>
                    <th className="text-left p-3">Usuário</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Vencimento</th>
                    <th className="text-left p-3">Downloads</th>
                    <th className="text-left p-3">Cadastro</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-zinc-500">Nenhum usuário.</td></tr>
                  ) : filteredUsers.map(u => {
                    const active = u.subscriptionStatus === 'active' && (!u.subscriptionExpiresAt || u.subscriptionExpiresAt > Date.now());
                    return (
                      <tr key={u.userId} className="border-t border-zinc-800 hover:bg-zinc-900/40">
                        <td className="p-3">
                          <div className="font-medium">{u.name || '—'}</div>
                          <div className="text-xs text-zinc-500">{u.email}</div>
                        </td>
                        <td className="p-3">
                          {active ? <span className="text-xs px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 font-bold">ATIVA</span>
                            : <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-bold">INATIVA</span>}
                          {u.subscriptionMethod && <div className="text-[10px] text-zinc-500 mt-1">{u.subscriptionMethod}</div>}
                        </td>
                        <td className="p-3 text-zinc-300">{fmtDate(u.subscriptionExpiresAt)}</td>
                        <td className="p-3 text-zinc-300">{u.totalDownloads || 0} <span className="text-zinc-500 text-xs">({u.downloadsToday || 0} hoje)</span></td>
                        <td className="p-3 text-zinc-400 text-xs">{fmtDate(u.createdAt)}</td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button onClick={() => setSubModal(u)} className="px-2 py-1 rounded bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 text-xs font-bold mr-1">Assinatura</button>
                          <button onClick={() => setEditingUser(u)} className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700"><Edit2 size={14} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
                <tr>
                  <th className="text-left p-3">Referência</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Valor</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Data</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-zinc-500">Nenhuma transação.</td></tr>
                ) : payments.map((p: any) => (
                  <tr key={p.externalReference || p.id} className="border-t border-zinc-800">
                    <td className="p-3 font-mono text-xs">{p.externalReference || '—'}</td>
                    <td className="p-3 text-zinc-300">{p.type || '—'}</td>
                    <td className="p-3 text-zinc-300">{fmtBRL(p.amount || 0)}</td>
                    <td className="p-3">
                      {p.status === 'approved' ? <span className="text-xs px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 font-bold">APROVADO</span>
                        : p.status === 'pending' ? <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold">PENDENTE</span>
                        : p.status === 'rejected' ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">REJEITADO</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-bold">{(p.status || '—').toUpperCase()}</span>}
                    </td>
                    <td className="p-3 text-zinc-400 text-xs">{fmtDate(p.createdAt)}</td>
                    <td className="p-3 text-right">
                      {p.externalReference && (
                        <button onClick={() => handleRefreshPayment(p.externalReference)} className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 inline-flex items-center gap-1">
                          <RefreshCw size={12} /> Sincronizar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {subModal && (
        <SubModal user={subModal} onClose={() => setSubModal(null)} onActivate={(d) => handleSetSub('active', d)} onCancel={() => handleSetSub('inactive')} />
      )}
      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUserSave} />
      )}
    </div>
  );
}

function SubModal({ user, onClose, onActivate, onCancel }: any) {
  const [days, setDays] = useState(30);
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="font-bold">Gerenciar assinatura</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-900"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="text-sm">
            <div className="text-zinc-400">{user.name || user.email}</div>
            <div className="text-xs text-zinc-500">{user.email}</div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Dias de assinatura</label>
            <input type="number" min={1} value={days} onChange={e => setDays(parseInt(e.target.value) || 30)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-lime-400" />
            <div className="flex gap-2 mt-2">
              {[7, 30, 90, 365].map(d => (
                <button key={d} onClick={() => setDays(d)} className="text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-lime-400/50">{d}d</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => onActivate(days)} className="flex-1 px-4 py-2 rounded-lg bg-lime-400 text-black font-bold hover:bg-lime-300 inline-flex items-center justify-center gap-2"><CheckCircle2 size={14} /> Ativar</button>
            <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 inline-flex items-center justify-center gap-2"><XCircle size={14} /> Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }: any) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="font-bold">Editar usuário</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-900"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-lime-400" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-lime-400" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Nova senha (opcional)</label>
            <input type="password" placeholder="deixe vazio para manter" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-lime-400" />
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sm">Cancelar</button>
          <button onClick={() => {
            const payload: any = {};
            if (name && name !== user.name) payload.name = name;
            if (email && email !== user.email) payload.email = email;
            if (password) payload.password = password;
            onSave(payload);
          }} className="px-4 py-2 rounded-lg bg-lime-400 text-black font-bold inline-flex items-center gap-2 text-sm"><Save size={14} /> Salvar</button>
        </div>
      </div>
    </div>
  );
}
