import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Star, X, Search, Tag as TagIcon } from 'lucide-react';
import { strategicCalendarApi, type StrategicEvent, MONTH_NAMES, isStillRelevant } from '../utils/strategicCalendar';
import { storeApi } from '../utils/storeApi';
import { toast } from 'sonner@2.0.3';

interface Props {
  onBack: () => void;
}

const SUGGESTED_TAGS = ['Em alta', 'Mais buscado', 'Tendência', 'Promocional', 'Sazonal'];

function emptyEvent(): StrategicEvent {
  const today = new Date().toISOString().slice(0, 10);
  return { id: `ev-${Date.now()}`, name: '', date: today, tags: [], productIds: [], featured: true, trending: false, description: '' };
}

export function AdminStrategicCalendar({ onBack }: Props) {
  const [events, setEvents] = useState<StrategicEvent[]>([]);
  const [editing, setEditing] = useState<StrategicEvent | null>(null);
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const sortIt = (arr: StrategicEvent[]) => (arr || []).slice().sort((a, b) => a.date.localeCompare(b.date));

  const reload = async () => {
    setEvents(sortIt(strategicCalendarApi.list()));
    try {
      const all = await strategicCalendarApi.refresh();
      setEvents(sortIt(all));
    } catch (e) {
      console.error('[AdminStrategicCalendar] refresh error:', e);
      toast.error('Servidor indisponível. Mostrando cache local.');
    }
  };

  useEffect(() => {
    reload();
    storeApi.getItems().then(res => {
      if (res?.success) setStoreItems(res.items || []);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    if (!editing) return [];
    const q = productSearch.toLowerCase();
    return storeItems.filter(i => (i.title || '').toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q));
  }, [storeItems, productSearch, editing]);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { toast.error('Nome do evento é obrigatório.'); return; }
    if (!editing.date) { toast.error('Data é obrigatória.'); return; }
    try {
      await strategicCalendarApi.upsert(editing);
      toast.success('Evento salvo!');
      setEditing(null);
      reload();
    } catch (e) {
      toast.error('Erro ao salvar no servidor. Cache local mantido.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este evento?')) return;
    try {
      await strategicCalendarApi.remove(id);
      toast.success('Evento excluído.');
      reload();
    } catch (e) {
      toast.error('Erro ao excluir no servidor.');
    }
  };

  const toggleTag = (tag: string) => {
    if (!editing) return;
    const has = editing.tags.includes(tag);
    setEditing({ ...editing, tags: has ? editing.tags.filter(t => t !== tag) : [...editing.tags, tag] });
  };

  const toggleProduct = (id: string) => {
    if (!editing) return;
    const has = editing.productIds.includes(id);
    setEditing({ ...editing, productIds: has ? editing.productIds.filter(p => p !== id) : [...editing.productIds, id] });
  };

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-bold">Calendário <span className="text-lime-400">Estratégico</span></h1>
          </div>
          <button onClick={() => setEditing(emptyEvent())} className="inline-flex items-center gap-2 bg-lime-400 text-black px-4 py-2 rounded-lg font-bold hover:bg-lime-300">
            <Plus size={16} /> Novo evento
          </button>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          {events.length === 0 ? (
            <p className="p-8 text-center text-zinc-500">Nenhum evento cadastrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
                <tr>
                  <th className="text-left p-3">Evento</th>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Mês</th>
                  <th className="text-left p-3">Produtos</th>
                  <th className="text-left p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => {
                  const d = new Date(ev.date + 'T00:00:00');
                  const expired = !isStillRelevant(ev);
                  return (
                    <tr key={ev.id} className="border-t border-zinc-800 hover:bg-zinc-900/40">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {ev.featured && <Star size={14} className="text-lime-400 shrink-0" />}
                          <span className="font-medium">{ev.name}</span>
                        </div>
                        {ev.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ev.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300">{t}</span>)}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-zinc-300">{d.toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 text-zinc-400">{MONTH_NAMES[d.getMonth()]}</td>
                      <td className="p-3 text-zinc-400">{ev.productIds.length}</td>
                      <td className="p-3">
                        {expired ? (
                          <span className="text-xs text-zinc-500">Expirado (oculto)</span>
                        ) : ev.featured ? (
                          <span className="text-xs text-lime-400 font-bold">Destaque</span>
                        ) : (
                          <span className="text-xs text-zinc-400">Ativo</span>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button onClick={() => setEditing({ ...ev })} className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium mr-1">Editar</button>
                        <button onClick={() => handleDelete(ev.id)} className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold">{events.some(e => e.id === editing.id) ? 'Editar evento' : 'Novo evento'}</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-full hover:bg-zinc-900"><X size={18} /></button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome do evento *</label>
                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-lime-400" placeholder="Ex.: Dia das Mães" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Data *</label>
                  <input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-lime-400" />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} className="accent-lime-400" />
                    <span className="text-sm">Destacar na Creator</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!editing.trending} onChange={e => setEditing({ ...editing, trending: e.target.checked })} className="accent-rose-400" />
                    <span className="text-sm">Em alta</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Descrição</label>
                <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-lime-400" />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><TagIcon size={12} /> Etiquetas</label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map(tag => {
                    const active = editing.tags.includes(tag);
                    return (
                      <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-medium border ${active ? 'bg-lime-400 text-black border-lime-400' : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'}`}>{tag}</button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-2">Vincular produtos da Creator</label>
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Buscar arte..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-lime-400" />
                </div>
                <div className="max-h-56 overflow-y-auto bg-zinc-900/50 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
                  {filteredProducts.length === 0 ? (
                    <p className="text-xs text-zinc-500 p-3 text-center">{storeItems.length === 0 ? 'Nenhum produto carregado (Edge Function offline?).' : 'Nenhum resultado.'}</p>
                  ) : filteredProducts.map(p => {
                    const checked = editing.productIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-zinc-900 cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={() => toggleProduct(p.id)} className="accent-lime-400" />
                        <span className="text-sm flex-1 truncate">{p.title}</span>
                        <span className="text-[10px] text-zinc-500">{p.category}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-zinc-500 mt-1">{editing.productIds.length} selecionado(s)</p>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sm">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-lime-400 text-black font-bold hover:bg-lime-300 text-sm inline-flex items-center gap-2">
                <Save size={14} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
