import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, Eye, User, Share2, Copy, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BlogPostViewProps {
  postId: string;
  onBack: () => void;
}

interface BlogPostData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  timestamp: number;
  views: number;
  author: string;
}

export function BlogPostView({ postId, onBack }: BlogPostViewProps) {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    setIsLoading(true);

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
        setPost(data.post);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateReadTime = (content: string) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const shareOnWhatsApp = () => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${post.title} - ${post.excerpt}`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnTwitter = () => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (isLoading) {
    return (
      <section className="min-h-screen py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <p className="text-gray-400">Carregando post...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="min-h-screen py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Post não encontrado</p>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all"
            >
              <ArrowLeft size={18} />
              Voltar ao Blog
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-lime-400 hover:text-lime-300 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar ao Blog
          </button>

          {/* Featured Image */}
          <div className="aspect-video rounded-2xl overflow-hidden border border-lime-400/20 mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Post Header */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-lime-400/10 text-lime-400 text-sm font-semibold rounded-full mb-4">
              {post.category}
            </span>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {post.title}
            </h1>

            <p className="text-xl text-gray-400 mb-6">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-500 pb-6 border-b border-lime-400/10">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.author || 'Ediliano Souza'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(post.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{calculateReadTime(post.content)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{post.views} visualizações</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div
            className="prose prose-invert prose-lime max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.75',
            }}
          />

          {/* Compartilhamento */}
          <div className="pt-8 border-t border-lime-400/10 mb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Share2 size={20} />
                <span className="font-semibold">Compartilhe este post:</span>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* WhatsApp */}
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-400 transition-all"
                  title="Compartilhar no WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={shareOnFacebook}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all"
                  title="Compartilhar no Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="hidden sm:inline">Facebook</span>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={shareOnTwitter}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all border border-gray-700"
                  title="Compartilhar no X (Twitter)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="hidden sm:inline">X</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={shareOnLinkedIn}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-600 transition-all"
                  title="Compartilhar no LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="hidden sm:inline">LinkedIn</span>
                </button>

                {/* Copiar Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-lime-400/10 text-lime-400 border border-lime-400/30 rounded-xl hover:bg-lime-400/20 transition-all"
                  title="Copiar link"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle size={20} />
                      <span className="hidden sm:inline">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      <span className="hidden sm:inline">Copiar Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="pt-8 border-t border-lime-400/10">
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all"
            >
              <ArrowLeft size={18} />
              Voltar ao Blog
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}