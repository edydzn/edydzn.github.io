import { useState, useEffect } from 'react';
import { storeApi as api } from '../../utils/storeApi';
import { Trash2, Edit, Save, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface StoreAdminProps {
  onBack: () => void;
}

export function StoreAdmin({ onBack }: StoreAdminProps) {
  const [view, setView] = useState<'list' | 'form' | 'stats'>('list');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'PSD',
    description: '',
    image: '',
    fileUrl: '',
    isFree: false,
    isFeatured: false,
    colors: ['', '', '', '', ''],
    gradient: ''
  });

  const CATEGORIES = ["PSD", "Affinity", "Canva", "Figma", "Corel", "Camisas", "Fotos", "Texturas", "Vetores", "Apresentações", "Mockups", "Selos 3D", "Paletas", "Outros"];

  const cleanGradient = (val: string) => {
    if (!val) return '';
    // Trim first, then remove semicolon, then remove property prefix (background or background-image)
    let clean = val.trim();
    clean = clean.replace(/;$/, '');
    clean = clean.replace(/^(background(-image)?:\s*)/i, '');
    return clean;
  };

  const formatColor = (c: string) => {
     if (!c) return 'transparent';
     let color = c.trim();
     if (!color.startsWith('#') && /^[0-9A-Fa-f]{3,6}$/.test(color)) {
        return '#' + color;
     }
     return color;
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.getItems();
      console.log("[StoreAdmin] Items response:", data);
      if (data.success) {
         setItems(data.items || []);
      } else {
         console.error("[StoreAdmin] Failed to load items:", data.error);
         alert(`Erro ao carregar itens: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("[StoreAdmin] Erro ao carregar itens:", error);
      alert('Erro de conexão ao carregar itens do Creator.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description,
      image: item.image,
      fileUrl: item.fileUrl,
      isFree: item.isFree,
      isFeatured: item.isFeatured,
      colors: item.colors && item.colors.length === 5 ? item.colors : ['', '', '', '', ''],
      gradient: item.gradient || ''
    });
    setEditingId(item.id);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    await api.deleteItem(id);
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Clean gradient and colors before sending
    const payload = {
       ...formData,
       colors: formData.colors.map(c => {
           if (!c || !c.trim()) return '';
           let color = c.trim();
           if (!color.startsWith('#') && /^[0-9A-Fa-f]{3,6}$/.test(color)) {
               return '#' + color;
           }
           return color;
       }),
       gradient: cleanGradient(formData.gradient)
    };

    try {
      let res;
      if (editingId) {
        res = await api.updateItem(editingId, payload);
      } else {
        res = await api.createItem(payload);
      }
      
      if (res.error) {
         alert(`Erro: ${res.error}`);
         setLoading(false);
         return;
      }

      setEditingId(null);
      setFormData({
        title: '',
        category: 'PSD',
        description: '',
        image: '',
        fileUrl: '',
        isFree: false,
        isFeatured: false,
        colors: ['', '', '', '', ''],
        gradient: ''
      });
      setView('list');
      fetchItems();
    } catch (e) {
      alert('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const updateColor = (index: number, val: string) => {
     const newColors = [...formData.colors];
     newColors[index] = val;
     setFormData({...formData, colors: newColors});
  };

  return (
    <div className="container mx-auto px-4 py-8 text-white min-h-screen">
       <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Administração do Creator</h1>
          <button onClick={onBack} className="text-zinc-400 hover:text-white">Voltar ao Dashboard</button>
       </div>

       <div className="flex gap-4 mb-6">
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg ${view === 'list' ? 'bg-lime-400 text-black' : 'bg-zinc-800'}`}>Produtos</button>
          <button onClick={() => { setView('form'); setEditingId(null); }} className={`px-4 py-2 rounded-lg ${view === 'form' ? 'bg-lime-400 text-black' : 'bg-zinc-800'}`}>Novo Produto</button>
       </div>

       {view === 'list' && (
         <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                     <th className="p-4">Imagem</th>
                     <th className="p-4">Título</th>
                     <th className="p-4">Categoria</th>
                     <th className="p-4">Tipo</th>
                     <th className="p-4">Ações</th>
                  </tr>
               </thead>
               <tbody>
                  {items.map(item => (
                     <tr key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="p-4 w-20">
                           <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden relative">
                              {item.category && item.category.trim().toLowerCase() === 'paletas' ? (
                                  item.gradient ? (
                                      <div className="w-full h-full" style={{ background: cleanGradient(item.gradient) }}></div>
                                  ) : (
                                      <div className="w-full h-full flex flex-col">
                                          {(item.colors || ['#333']).slice(0, 5).map((c: string, i: number) => (
                                              <div key={i} className="flex-1 w-full" style={{ backgroundColor: formatColor(c) }}></div>
                                          ))}
                                      </div>
                                  )
                              ) : (
                                  <ImageWithFallback src={item.image} className="w-full h-full object-cover" />
                              )}
                           </div>
                        </td>
                        <td className="p-4 font-medium">{item.title} {item.isFeatured && '⭐'}</td>
                        <td className="p-4 text-zinc-400">{item.category}</td>
                        <td className="p-4">
                           {item.isFree ? <span className="text-lime-400">Grátis</span> : <span className="text-zinc-400">Premium</span>}
                        </td>
                        <td className="p-4 flex gap-2">
                           <button onClick={() => handleEdit(item)} className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20"><Edit size={16} /></button>
                           <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"><Trash2 size={16} /></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {items.length === 0 && <div className="p-8 text-center text-zinc-500">Nenhum item cadastrado.</div>}
         </div>
       )}

       {view === 'form' && (
         <div className="max-w-2xl bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Item' : 'Novo Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-xs text-zinc-400 mb-1">Título</label>
                  <input className="w-full bg-black border border-zinc-700 rounded p-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs text-zinc-400 mb-1">Categoria</label>
                     <select className="w-full bg-black border border-zinc-700 rounded p-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.isFree} onChange={e => setFormData({...formData, isFree: e.target.checked})} />
                        <span className="text-sm">Gratuito</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} />
                        <span className="text-sm">Destaque</span>
                     </label>
                  </div>
               </div>

               {formData.category.trim().toLowerCase() === 'paletas' && (
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-4">
                     <div>
                        <label className="block text-xs text-zinc-400 mb-2">Degradê CSS (Opcional - Substitui as cores)</label>
                        <input 
                           type="text" 
                           placeholder="linear-gradient(to right, #ff0000, #00ff00)" 
                           className="w-full bg-black border border-zinc-700 rounded p-2 text-sm" 
                           value={formData.gradient} 
                           onChange={e => setFormData({...formData, gradient: e.target.value})}
                        />
                        {formData.gradient && (
                           <div className="mt-2 h-10 w-full rounded border border-zinc-700" style={{ background: cleanGradient(formData.gradient) }}></div>
                        )}
                     </div>

                     <div>
                        <label className="block text-xs text-zinc-400 mb-2">Ou Cores Sólidas (Hexadecimal)</label>
                        <div className="grid grid-cols-5 gap-2">
                           {formData.colors.map((color, idx) => (
                              <div key={idx} className="space-y-1">
                                 <div className="h-10 w-full rounded border border-zinc-700 mb-1" style={{ backgroundColor: formatColor(color) }}></div>
                                 <input 
                                    type="text" 
                                    placeholder="#000000" 
                                    className="w-full bg-black border border-zinc-700 rounded p-1 text-xs text-center uppercase" 
                                    value={color} 
                                    onChange={e => updateColor(idx, e.target.value)}
                                    maxLength={7}
                                 />
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               <div>
                  <label className="block text-xs text-zinc-400 mb-1">Descrição</label>
                  <textarea className="w-full bg-black border border-zinc-700 rounded p-2" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               </div>

               {formData.category.trim().toLowerCase() !== 'paletas' && (
                  <>
                     <div>
                        <label className="block text-xs text-zinc-400 mb-1">URL da Imagem (Preview)</label>
                        <input className="w-full bg-black border border-zinc-700 rounded p-2" placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required={formData.category.trim().toLowerCase() !== 'paletas'} />
                     </div>

                     <div>
                        <label className="block text-xs text-zinc-400 mb-1">URL do Arquivo (Download)</label>
                        <input className="w-full bg-black border border-zinc-700 rounded p-2" placeholder="https://..." value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} required={formData.category.trim().toLowerCase() !== 'paletas'} />
                     </div>
                  </>
               )}

               <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setView('list')} className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700">Cancelar</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-lime-400 text-black font-bold rounded hover:bg-lime-300 flex items-center gap-2">
                     {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Salvar</>}
                  </button>
               </div>
            </form>
         </div>
       )}
    </div>
  );
}