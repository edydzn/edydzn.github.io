import { motion } from 'motion/react';
import { ArrowLeft, Send, Image as ImageIcon, Video, AlertCircle, CheckCircle, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logoImage from '../../imports/logo_ediliano_designer_branco_e_verde.png';

interface BlogEditorProps {
  postId?: string;
  onBack: () => void;
  onSave: () => void;
}

export function BlogEditor({ postId, onBack, onSave }: BlogEditorProps) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/blog-posts/${postId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.post) {
        setTitle(data.post.title);
        setExcerpt(data.post.excerpt);
        setContent(data.post.content);
        setCategory(data.post.category);
        setImage(data.post.image);
        setFeatured(data.post.featured || false);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Erro ao carregar post');
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    // Validation
    if (!title.trim() || !excerpt.trim() || !content.trim() || !category.trim() || !image.trim()) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const method = postId ? 'PUT' : 'POST';
      const url = postId
        ? `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/blog-posts/${postId}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/blog-posts`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          category,
          image,
          featured,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(postId ? 'Post atualizado e publicado com sucesso! ✅' : 'Post criado e publicado com sucesso! ✅');
        setTimeout(() => {
          onSave();
        }, 1500);
      } else {
        setError(data.error || 'Erro ao publicar post');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const insertImage = () => {
    const url = prompt('Insira a URL da imagem:');
    if (url) {
      const imageMarkdown = `\n![Imagem](${url})\n`;
      setContent(content + imageMarkdown);
    }
  };

  const insertVideo = () => {
    const url = prompt('Insira a URL do vídeo (YouTube ou Vimeo):');
    if (url) {
      let embedUrl = url;
      
      // Convert YouTube URL to embed
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      const videoMarkdown = `\n<iframe width="100%" height="400" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`;
      setContent(content + videoMarkdown);
    }
  };

  // Text formatting functions
  const insertFormatting = (tag: string, isBlock: boolean = false) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    let newText = '';
    
    if (selectedText) {
      // If text is selected, wrap it
      if (isBlock) {
        newText = `${beforeText}<${tag}>${selectedText}</${tag}>${afterText}`;
      } else {
        newText = `${beforeText}<${tag}>${selectedText}</${tag}>${afterText}`;
      }
    } else {
      // If no selection, insert tags
      if (isBlock) {
        newText = `${beforeText}<${tag}>Texto aqui</${tag}>${afterText}`;
      } else {
        newText = `${beforeText}<${tag}>Texto aqui</${tag}>${afterText}`;
      }
    }

    setContent(newText);
    
    // Set cursor position
    setTimeout(() => {
      if (selectedText) {
        textarea.selectionStart = start;
        textarea.selectionEnd = end + tag.length * 2 + 5;
      } else {
        textarea.selectionStart = start + tag.length + 2;
        textarea.selectionEnd = start + tag.length + 12;
      }
      textarea.focus();
    }, 0);
  };

  const insertAlignment = (alignment: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    let alignStyle = '';
    switch (alignment) {
      case 'left':
        alignStyle = 'text-align: left;';
        break;
      case 'center':
        alignStyle = 'text-align: center;';
        break;
      case 'right':
        alignStyle = 'text-align: right;';
        break;
      case 'justify':
        alignStyle = 'text-align: justify;';
        break;
    }

    let newText = '';
    if (selectedText) {
      newText = `${beforeText}<div style="${alignStyle}">${selectedText}</div>${afterText}`;
    } else {
      newText = `${beforeText}<div style="${alignStyle}">Texto aqui</div>${afterText}`;
    }

    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Insira a URL do link:');
    if (!url) return;

    const text = prompt('Texto do link:', 'Clique aqui');
    if (!text) return;

    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = content.substring(0, start);
    const afterText = content.substring(start);

    const newText = `${beforeText}<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>${afterText}`;
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const insertList = (ordered: boolean = false) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = content.substring(0, start);
    const afterText = content.substring(start);

    const listType = ordered ? 'ol' : 'ul';
    const newText = `${beforeText}\n<${listType}>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</${listType}>\n${afterText}`;
    
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  // Handle Enter key to add spacing between lines
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      const textarea = contentRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const beforeText = content.substring(0, start);
      const afterText = content.substring(end);

      // Insert line break with spacing (paragraph tag)
      const newText = `${beforeText}<br/>\n${afterText}`;
      
      setContent(newText);
      
      // Set cursor position after the break
      setTimeout(() => {
        const newPosition = start + 6; // Length of '<br/>\n'
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <section className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-3 rounded-xl font-semibold hover:bg-zinc-700 transition-all"
              >
                <ArrowLeft size={18} />
                Voltar
              </button>
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="text-lime-400">{postId ? 'Editar' : 'Novo'}</span> Post
              </h2>
            </div>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all disabled:opacity-50"
            >
              <Send size={18} />
              {isLoading ? 'Publicando...' : postId ? 'Atualizar' : 'Publicar'}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-400"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-2 text-green-400"
            >
              <CheckCircle size={20} />
              {success}
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-lime-400">
                Título do Post *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do post"
                className="w-full px-4 py-3 bg-zinc-900 border border-lime-400/20 rounded-xl focus:border-lime-400 focus:outline-none text-white"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-lime-400">
                Resumo/Excerpt *
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Breve descrição do post (exibida nos cards)"
                rows={2}
                className="w-full px-4 py-3 bg-zinc-900 border border-lime-400/20 rounded-xl focus:border-lime-400 focus:outline-none text-white resize-none"
              />
            </div>

            {/* Category and Featured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-lime-400">
                  Categoria *
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Design, Tendências, Tutorial"
                  className="w-full px-4 py-3 bg-zinc-900 border border-lime-400/20 rounded-xl focus:border-lime-400 focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-lime-400">
                  Configurações
                </label>
                <label className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-lime-400/20 rounded-xl cursor-pointer hover:border-lime-400/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-5 h-5 rounded border-lime-400/30 bg-zinc-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-0"
                  />
                  <span className="text-white">Post em Destaque (Carrossel)</span>
                </label>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-lime-400">
                URL da Imagem de Capa *
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full px-4 py-3 bg-zinc-900 border border-lime-400/20 rounded-xl focus:border-lime-400 focus:outline-none text-white"
              />
              {image && (
                <div className="mt-3 rounded-xl overflow-hidden border border-lime-400/20">
                  <img src={image} alt="Preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </div>

            {/* Content Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-lime-400">
                  Conteúdo do Post * (suporta HTML e Markdown)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={insertImage}
                    className="flex items-center gap-2 text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <ImageIcon size={14} />
                    Imagem
                  </button>
                  <button
                    onClick={insertVideo}
                    className="flex items-center gap-2 text-xs bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg hover:bg-purple-500 hover:text-white transition-colors"
                  >
                    <Video size={14} />
                    Vídeo
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="bg-zinc-900 border border-lime-400/20 rounded-t-xl p-2 flex flex-wrap gap-1">
                {/* Text Formatting */}
                <div className="flex gap-1 pr-2 border-r border-lime-400/20">
                  <button
                    type="button"
                    onClick={() => insertFormatting('strong')}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black transition-all text-white"
                    title="Negrito"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('em')}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black transition-all text-white"
                    title="Itálico"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('u')}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black transition-all text-white"
                    title="Sublinhado"
                  >
                    <Underline size={16} />
                  </button>
                </div>

                {/* Text Alignment */}
                <div className="flex gap-1 pr-2 border-r border-lime-400/20">
                  <button
                    type="button"
                    onClick={() => insertAlignment('left')}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black transition-all text-white"
                    title="Alinhar à Esquerda"
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAlignment('center')}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black transition-all text-white"
                    title="Centralizar"
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAlignment('right')}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black transition-all text-white"
                    title="Alinhar à Direita"
                  >
                    <AlignRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAlignment('justify')}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black transition-all text-white"
                    title="Justificar"
                  >
                    <AlignJustify size={16} />
                  </button>
                </div>

                {/* Lists and Links */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => insertList(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black transition-all text-white"
                    title="Lista com Marcadores"
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertList(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black transition-all text-white"
                    title="Lista Numerada"
                  >
                    <ListOrdered size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={insertLink}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black transition-all text-white"
                    title="Inserir Link"
                  >
                    <Link size={16} />
                  </button>
                </div>
              </div>

              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite o conteúdo completo do post..."
                rows={20}
                className="w-full px-4 py-3 bg-zinc-900 border border-lime-400/20 border-t-0 rounded-b-xl focus:border-lime-400 focus:outline-none text-white resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Dica: Pressione Enter para adicionar espaçamento entre linhas. Use Shift+Enter para nova linha sem espaço.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-lime-400/10">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-semibold hover:bg-zinc-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 bg-lime-400 text-black px-8 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all disabled:opacity-50"
              >
                <Send size={18} />
                {isLoading ? 'Publicando...' : postId ? 'Atualizar e Publicar' : 'Publicar Post'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Logo no rodapé */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <img src={logoImage} alt="Ediliano Designer" className="h-6 opacity-40 hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>
    </section>
  );
}