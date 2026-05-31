import { useState, useEffect } from 'react';
import { Plus, Search, Star, ExternalLink, Edit2, Trash2, ArrowLeft, Briefcase, RefreshCw, Grid } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { PortfolioModal, PortfolioItem } from './PortfolioModal';
import logoImage from '../../imports/logo_ediliano_designer_branco_e_verde.png';

interface AdminPortfolioProps {
  onBack: () => void;
}

export function AdminPortfolio({ onBack }: AdminPortfolioProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | undefined>(undefined);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/portfolio`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (item: Partial<PortfolioItem>) => {
    const isEdit = !!item.id;
    const url = isEdit 
      ? `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/portfolio/${item.id}`
      : `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/portfolio`;
    
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(item)
    });

    if (!res.ok) throw new Error('Erro ao salvar projeto');

    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/portfolio/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    fetchItems();
    setIsModalOpen(false); // Close modal if open
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
       {/* Header */}
       <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-20 shadow-xl">
         <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                 <ArrowLeft size={20} />
               </button>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-lime-400/10 rounded-lg flex items-center justify-center">
                   <Briefcase size={20} className="text-lime-400" />
                 </div>
                 <div>
                   <h1 className="text-xl font-bold">Portfólio</h1>
                   <p className="text-xs text-gray-400">Gestão de Projetos</p>
                 </div>
               </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                 <input 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Buscar projetos..." 
                   className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-lime-400 outline-none"
                 />
               </div>
               <button onClick={() => { setSelectedItem(undefined); setIsModalOpen(true); }} className="bg-lime-400 hover:bg-lime-300 text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors">
                 <Plus size={18} /> Novo Projeto
               </button>
            </div>
         </div>
       </header>

       <main className="flex-1 p-6 container mx-auto max-w-7xl">
         {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
               <RefreshCw className="animate-spin mb-2" />
               <p>Carregando projetos...</p>
            </div>
         ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
               <Grid size={48} className="mb-4 opacity-20" />
               <p className="text-lg font-medium">Nenhum projeto encontrado</p>
               <p className="text-sm opacity-60">Adicione seu primeiro trabalho ao portfólio.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredItems.map(item => (
                 <div key={item.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-lime-400/50 transition-all shadow-lg hover:shadow-lime-400/10">
                    {/* Image Area */}
                    <div className="aspect-video relative overflow-hidden bg-black">
                       <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => { setSelectedItem(item); setIsModalOpen(true); }} className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform">
                             <Edit2 size={18} />
                          </button>
                          {item.link && (
                             <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-lime-400 text-black rounded-full hover:scale-110 transition-transform">
                                <ExternalLink size={18} />
                             </a>
                          )}
                       </div>
                       {item.featured && (
                          <div className="absolute top-2 right-2 bg-lime-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                             <Star size={10} fill="black" /> Destaque
                          </div>
                       )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                       <div className="text-xs text-lime-400 font-medium mb-1 uppercase tracking-wider">{item.category}</div>
                       <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{item.title}</h3>
                       <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-zinc-800 mt-2">
                          <span>Adicionado em {new Date(item.timestamp || Date.now()).toLocaleDateString('pt-BR')}</span>
                          <button onClick={() => handleDelete(item.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         )}
       </main>

       {/* Footer */}
       <div className="py-6 text-center border-t border-zinc-900">
        <img src={logoImage} alt="Ediliano Designer" className="h-6 opacity-30 hover:opacity-100 transition-opacity mx-auto" />
       </div>

       <PortfolioModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         onDelete={handleDelete}
         initialData={selectedItem}
       />
    </div>
  );
}