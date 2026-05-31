import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Loader2, Link as LinkIcon, Star, Image as ImageIcon } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  link?: string;
  featured: boolean;
}

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<PortfolioItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  initialData?: PortfolioItem;
}

export function PortfolioModal({ isOpen, onClose, onSave, onDelete, initialData }: PortfolioModalProps) {
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    title: '',
    category: 'Identidade Visual',
    image: '',
    link: '',
    featured: false
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
            title: '',
            category: 'Identidade Visual',
            image: '',
            link: '',
            featured: false
        });
      }
    }
  }, [isOpen, initialData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: formDataUpload
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      alert('Título e imagem são obrigatórios.');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar projeto. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h3 className="text-xl font-bold text-white">
              {initialData ? 'Editar Projeto' : 'Novo Projeto'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
               <label className="text-sm text-gray-400">Capa do Projeto</label>
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className={`
                    relative aspect-video rounded-lg border-2 border-dashed border-zinc-700 
                    flex flex-col items-center justify-center cursor-pointer hover:border-lime-400 hover:bg-zinc-800/50 transition-all overflow-hidden
                    ${formData.image ? 'border-solid border-zinc-800' : ''}
                 `}
               >
                 {formData.image ? (
                   <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="flex flex-col items-center gap-2 text-gray-500">
                      {isUploading ? <Loader2 className="animate-spin text-lime-400" /> : <Upload size={24} />}
                      <span className="text-xs">Clique para upload</span>
                   </div>
                 )}
                 <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
               </div>
            </div>

            {/* Inputs */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Título</label>
              <input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-lime-400 outline-none"
                placeholder="Nome do projeto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-lime-400 outline-none"
                  >
                    <option>Identidade Visual</option>
                    <option>Social Media</option>
                    <option>Web Design</option>
                    <option>Motion</option>
                    <option>Impresso</option>
                  </select>
                </div>
                <div>
                   <label className="text-xs text-gray-400 mb-1 block">Destaque?</label>
                   <button
                     type="button"
                     onClick={() => setFormData({...formData, featured: !formData.featured})}
                     className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                       formData.featured 
                         ? 'bg-lime-400/10 border-lime-400 text-lime-400' 
                         : 'bg-zinc-900 border-zinc-800 text-gray-400'
                     }`}
                   >
                     <Star size={16} fill={formData.featured ? "currentColor" : "none"} />
                     {formData.featured ? 'Destacado' : 'Normal'}
                   </button>
                </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Link Externo (Opcional)</label>
              <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded-lg px-3 py-2">
                 <LinkIcon size={14} className="text-gray-500" />
                 <input 
                   value={formData.link} 
                   onChange={e => setFormData({...formData, link: e.target.value})}
                   className="flex-1 bg-transparent text-white outline-none text-sm"
                   placeholder="https://behance.net/..."
                 />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {initialData && (
                 <button
                   type="button"
                   onClick={() => onDelete(initialData.id!)}
                   className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 text-sm font-semibold"
                 >
                   Excluir
                 </button>
              )}
              <div className="flex-1"></div>
              <button onClick={onClose} type="button" className="px-4 py-2 text-gray-400 hover:text-white text-sm font-semibold">Cancelar</button>
              <button 
                type="submit" 
                disabled={isSaving || isUploading}
                className="px-6 py-2 bg-lime-400 text-black rounded-lg hover:bg-lime-300 text-sm font-bold disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}