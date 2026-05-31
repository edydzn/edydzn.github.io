import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Calendar, Clock, Image as ImageIcon, Video, Loader2, Upload, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface CalendarPostData {
  id: string;
  date: string;
  content: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'twitter';
  type: 'post' | 'reels' | 'shorts' | 'video' | 'story' | 'tiktok';
  status: 'draft' | 'scheduled' | 'published' | 'error';
  time: string;
  media?: { url: string; type: 'image' | 'video' }[];
  errorMessage?: string;
}

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: CalendarPostData) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  initialData?: CalendarPostData;
  selectedDate?: Date;
}

import { PostPreview } from './PostPreview';

export function PostModal({ isOpen, onClose, onSave, onDelete, initialData, selectedDate }: PostModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CalendarPostData>(() => ({
    id: initialData?.id || '',
    date: initialData?.date || selectedDate?.toISOString() || new Date().toISOString(),
    content: initialData?.content || '',
    platform: initialData?.platform || 'instagram',
    type: initialData?.type || 'post',
    status: initialData?.status || 'draft',
    time: initialData?.time || '10:00',
    media: initialData?.media || [],
    errorMessage: initialData?.errorMessage
  }));

  // Reset/Update form when opening
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id || '',
          date: initialData.date || new Date().toISOString(),
          content: initialData.content || '',
          platform: initialData.platform || 'instagram',
          type: initialData.type || 'post',
          status: initialData.status || 'draft',
          time: initialData.time || '10:00',
          media: initialData.media || [],
          errorMessage: initialData.errorMessage
        });
      } else {
        // Reset for new post
        setFormData({
          id: '',
          date: selectedDate?.toISOString() || new Date().toISOString(),
          content: '',
          platform: 'instagram',
          type: 'post',
          status: 'draft',
          time: '10:00',
          media: [],
          errorMessage: undefined
        });
      }
    }
  }, [isOpen, initialData, selectedDate]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newMedia = [...(formData.media || [])];

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formDataUpload
        });

        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        
        newMedia.push({
          url: data.url,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        });
      }

      setFormData(prev => ({ ...prev, media: newMedia }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Erro ao fazer upload da mídia.');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (index: number) => {
    const newMedia = [...(formData.media || [])];
    newMedia.splice(index, 1);
    setFormData(prev => ({ ...prev, media: newMedia }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Se estava com erro e o usuário salvou, vamos tentar resetar para draft ou o que ele escolheu, limpando erro
      const dataToSave = { ...formData };
      if (formData.status !== 'error') {
          delete dataToSave.errorMessage;
      }
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    setIsDeleting(true);
    try {
      if (initialData?.id) {
        await onDelete(initialData.id);
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

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
          className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-white">
                {initialData ? 'Editar Post' : 'Novo Post'}
              </h3>
              <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                <Calendar size={14} />
                {format(new Date(formData.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 h-full">
              
              {/* Form Column */}
              <div className="p-6">
                {formData.status === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-6 flex items-start gap-3 animate-pulse">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-sm font-bold text-red-400">Falha na Publicação Automática</h4>
                      <p className="text-xs text-red-300 mt-1">
                        {formData.errorMessage || 'Ocorreu um erro ao tentar publicar este post. Verifique a conexão da conta ou tente novamente.'}
                      </p>
                    </div>
                  </div>
                )}

                <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Platform Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Plataforma</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'instagram', label: 'Instagram' },
                          { id: 'facebook', label: 'Facebook' },
                          { id: 'twitter', label: 'X (Twitter)' },
                          { id: 'youtube', label: 'YouTube' },
                          { id: 'tiktok', label: 'TikTok' },
                        ].map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, platform: p.id as any })}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              formData.platform === p.id
                                ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20'
                                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Formato</label>
                      <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                      >
                        <option value="post">Post (Feed)</option>
                        <option value="story">Story</option>
                        <option value="reels">Reels</option>
                        <option value="shorts">Shorts</option>
                        <option value="video">Vídeo Longo</option>
                        <option value="tiktok">TikTok Video</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* TikTok Warning */}
                  {formData.platform === 'tiktok' && (
                     <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-xs text-cyan-400 flex gap-2 items-start">
                        <Video size={14} className="mt-0.5 shrink-0" />
                        <div>
                           <strong>Requisito TikTok:</strong> É obrigatório fazer o upload de um vídeo. A legenda será usada como título/descrição.
                        </div>
                     </div>
                  )}

                  {/* Media Upload Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Mídia (Imagens/Vídeos)</label>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Existing Media */}
                      {formData.media?.map((item, index) => (
                        <div key={index} className="relative aspect-square bg-black rounded-lg overflow-hidden group border border-zinc-800">
                          {item.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                              <Video className="text-gray-500" />
                            </div>
                          ) : (
                            <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/50 px-1.5 rounded text-[10px] text-white uppercase">
                            {item.type}
                          </div>
                        </div>
                      ))}

                      {/* Upload Button */}
                      <label className="aspect-square bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-lime-400 hover:bg-lime-400/5 transition-all group">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <Loader2 className="animate-spin text-lime-400" />
                        ) : (
                          <>
                            <Upload className="text-gray-500 group-hover:text-lime-400 mb-2" size={20} />
                            <span className="text-xs text-gray-500 group-hover:text-lime-400 font-medium">Adicionar</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Content/Caption */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Legenda / Descrição</label>
                    <textarea
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Escreva a legenda do post..."
                      className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors min-h-[120px] resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Time */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-400">Horário</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="time"
                          value={formData.time}
                          onChange={e => setFormData({ ...formData, time: e.target.value })}
                          className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-400">Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                      >
                        <option value="draft">Rascunho</option>
                        <option value="scheduled">Agendado</option>
                        <option value="published">Publicado</option>
                        {formData.status === 'error' && <option value="error">Erro</option>}
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              {/* Preview Column */}
              <div className="p-6 bg-zinc-950/50 flex flex-col">
                <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Pré-visualização</h4>
                <div className="flex-1 flex items-center justify-center bg-black/50 rounded-2xl border border-zinc-800 p-4">
                  <div className="w-full max-w-[350px]">
                    <PostPreview post={formData} />
                  </div>
                </div>
                <p className="text-xs text-center text-gray-500 mt-4">
                  Visualização simulada. A aparência real pode variar dependendo do dispositivo e da plataforma.
                </p>

                {/* Actions */}
                <div className="mt-auto pt-6 flex gap-3">
                  {initialData?.id && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                          onDelete(initialData.id!);
                          onClose();
                        }
                      }}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Excluir
                    </button>
                  )}
                  
                  <div className="flex-1 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      form="post-form"
                      disabled={isSaving}
                      className="px-6 py-2 bg-lime-400 hover:bg-lime-300 text-black rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : initialData ? 'Salvar Alterações' : 'Agendar Post'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-between shrink-0">
            {initialData ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-400/10"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Excluir
              </button>
            ) : (
              <div /> // Spacer
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="post-form"
                disabled={isSaving || isUploading}
                className="bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-black px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-lime-400/20"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {initialData ? 'Salvar Alterações' : 'Agendar Post'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}