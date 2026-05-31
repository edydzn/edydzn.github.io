import { motion } from 'motion/react';
import { BookOpen, RefreshCw, AlertCircle, LogOut, Plus, Edit, Trash2, ArrowLeft, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logoImage from '../../imports/logo_ediliano_designer_branco_e_verde.png';

interface BlogPostData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  featured: boolean;
  timestamp: number;
  createdAt: string;
  views: number;
  author: string;
}

interface BlogAdminProps {
  onLogout?: () => void;
  onBack?: () => void;
  onEditPost: (postId: string) => void;
  onNewPost: () => void;
}

export function BlogAdmin({ onLogout, onBack, onEditPost, onNewPost }: BlogAdminProps) {
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/blog-posts`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts || []);
      } else {
        setError(data.error || 'Erro ao carregar posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/blog-posts/${postId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId));
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao excluir post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Erro ao conectar com o servidor');
    }
  };

  const toggleFeatured = async (postId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/blog-posts/${postId}/featured`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ featured: !currentFeatured }),
        }
      );

      if (response.ok) {
        setPosts(posts.map(p => 
          p.id === postId ? { ...p, featured: !currentFeatured } : p
        ));
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao atualizar post');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminAuthTime');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <section className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-3 rounded-xl font-semibold hover:bg-zinc-700 transition-all"
                >
                  <ArrowLeft size={18} />
                  Voltar
                </button>
              )}
              <h2 className="text-4xl md:text-6xl font-bold">
                <span className="text-lime-400">Gerenciar</span> Blog
              </h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={onNewPost}
                className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all"
              >
                <Plus size={18} />
                Novo Post
              </button>
              <button
                onClick={fetchPosts}
                disabled={isLoading}
                className="flex items-center gap-2 bg-zinc-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-600 transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                Atualizar
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-400 transition-all"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-lg">
            Total de posts: <span className="text-lime-400 font-bold">{posts.length}</span>
          </p>
        </motion.div>

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

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw size={40} className="animate-spin text-lime-400 mx-auto mb-4" />
            <p className="text-gray-400">Carregando posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-zinc-900 rounded-2xl border border-lime-400/20"
          >
            <BookOpen size={60} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">Nenhum post publicado ainda</p>
            <button
              onClick={onNewPost}
              className="inline-flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all"
            >
              <Plus size={18} />
              Criar Primeiro Post
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-zinc-900 border border-lime-400/20 rounded-2xl overflow-hidden hover:border-lime-400/50 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-xl">{post.title}</h3>
                          {post.featured && (
                            <span className="px-2 py-1 bg-lime-400/20 text-lime-400 text-xs font-bold rounded">
                              DESTAQUE
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-lime-400/10 text-lime-400 rounded">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {post.views || 0} visualizações
                          </span>
                          <span>Por: {post.author || 'Ediliano Souza'}</span>
                          <span>{formatDate(post.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-lime-400/10">
                      <button
                        onClick={() => toggleFeatured(post.id, post.featured)}
                        className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                          post.featured
                            ? 'bg-lime-400 text-black hover:bg-lime-300'
                            : 'bg-lime-400/10 text-lime-400 hover:bg-lime-400/20'
                        }`}
                      >
                        {post.featured ? 'Remover Destaque' : 'Destacar'}
                      </button>
                      <button
                        onClick={() => onEditPost(post.id)}
                        className="flex items-center gap-2 text-sm bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        <Edit size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="flex items-center gap-2 text-sm bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

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