import { useEffect, useState } from 'react';
import { X, User as UserIcon, Save, Download, Loader2, History } from 'lucide-react';
import { storeApi } from '../../utils/storeApi';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userStatus: any;
  session: any;
  onUpdated: () => void;
}

const fmtDate = (ts: number) => {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export function StoreUserAccount({ isOpen, onClose, userStatus, session, onUpdated }: Props) {
  const [tab, setTab] = useState<'profile' | 'downloads'>('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loadingDl, setLoadingDl] = useState(false);

  useEffect(() => {
    if (!isOpen || !session) return;
    setName(session.user?.user_metadata?.full_name || '');
    setEmail(session.user?.email || '');
    setPassword('');
    setLoadingDl(true);
    storeApi.myDownloads().then(res => {
      if (res?.success) setDownloads(res.downloads || []);
    }).finally(() => setLoadingDl(false));
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {};
      if (name && name !== session.user?.user_metadata?.full_name) payload.name = name;
      if (email && email !== session.user?.email) payload.email = email;
      if (password) payload.password = password;
      if (Object.keys(payload).length === 0) { toast.info('Nada a alterar.'); setSaving(false); return; }
      const res = await storeApi.updateProfile(payload);
      if (res?.success) {
        toast.success('Perfil atualizado!');
        if (payload.password) await supabase.auth.refreshSession();
        onUpdated();
        setPassword('');
      } else {
        toast.error(res?.error || 'Erro ao atualizar.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Erro');
    } finally {
      setSaving(false);
    }
  };

  const isSubscriber = userStatus?.subscriptionStatus === 'active';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <UserIcon size={18} className="text-lime-400" />
            <h3 className="font-bold">Minha conta</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-900"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 border-b border-zinc-800">
          <div className="bg-zinc-900 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Status</div>
            <div className={`font-bold mt-1 ${isSubscriber ? 'text-lime-400' : 'text-zinc-400'}`}>{isSubscriber ? 'Premium' : 'Gratuito'}</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Hoje</div>
            <div className="font-bold mt-1 text-white">{userStatus?.downloadsToday || 0}/5</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Total</div>
            <div className="font-bold mt-1 text-white">{userStatus?.totalDownloads || 0}</div>
          </div>
        </div>

        <div className="flex border-b border-zinc-800">
          {(['profile', 'downloads'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? 'border-lime-400 text-lime-400' : 'border-transparent text-zinc-400'}`}>
              {t === 'profile' ? 'Perfil' : 'Histórico'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'profile' ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-lime-400" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-lime-400" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nova senha</label>
                <input type="password" placeholder="deixe vazio para manter a atual" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-lime-400" />
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full mt-2 bg-lime-400 text-black font-bold py-2.5 rounded-lg hover:bg-lime-300 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar alterações
              </button>
            </div>
          ) : (
            <div>
              {loadingDl ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-lime-400" /></div>
              ) : downloads.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <History size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Nenhum download ainda.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {downloads.map((d: any) => (
                    <li key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                      <Download size={16} className="text-lime-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{d.itemTitle || d.itemId}</div>
                        <div className="text-xs text-zinc-500">{fmtDate(d.timestamp)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
