import { motion } from 'motion/react';
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  timestamp: number;
  featured: boolean;
  views: number;
  author: string;
}

interface BlogWithPaginationProps {
  onSelectPost?: (postId: string) => void;
}

const POSTS_PER_PAGE = 15;

export function BlogWithPagination({ onSelectPost }: BlogWithPaginationProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Auto-rotate carousel every 5 seconds
    if (featuredPosts.length > 0) {
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % featuredPosts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredPosts]);

  const fetchPosts = async () => {
    setIsLoading(true);

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
        const allPosts = data.posts || [];
        setPosts(allPosts);
        setFeaturedPosts(allPosts.filter((p: BlogPost) => p.featured).slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateReadTime = (excerpt: string) => {
    const words = excerpt.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  // Pagination
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextCarouselSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % featuredPosts.length);
  };

  const prevCarouselSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
  };

  return (
    <section className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-lime-400">Blog</span> & Insights
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Artigos, dicas e insights sobre design gráfico, criatividade e tendências do mercado
          </p>
        </motion.div>

        {/* Featured Carousel */}
        {featuredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold mb-6 text-lime-400">Posts em Destaque</h3>
            <div className="relative rounded-2xl overflow-hidden border border-lime-400/30 bg-zinc-900">
              <div className="relative h-[400px] md:h-[500px]">
                {featuredPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === carouselIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${post.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <span className="inline-block px-3 py-1 bg-lime-400 text-black text-xs font-semibold rounded-full mb-4">
                        {post.category}
                      </span>
                      <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                        {post.title}
                      </h3>
                      <p className="text-gray-300 text-lg mb-6 max-w-3xl">
                        {post.excerpt}
                      </p>
                      <button
                        onClick={() => onSelectPost?.(post.id)}
                        className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all"
                      >
                        Ler Agora <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              {featuredPosts.length > 1 && (
                <>
                  <button
                    onClick={prevCarouselSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-lime-400 rounded-full flex items-center justify-center transition-all group"
                  >
                    <ChevronLeft size={24} className="text-white group-hover:text-black" />
                  </button>
                  <button
                    onClick={nextCarouselSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-lime-400 rounded-full flex items-center justify-center transition-all group"
                  >
                    <ChevronRight size={24} className="text-white group-hover:text-black" />
                  </button>

                  {/* Carousel Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {featuredPosts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCarouselIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === carouselIndex
                            ? 'bg-lime-400 w-8'
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Posts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Carregando posts...</p>
          </div>
        ) : currentPosts.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-lime-400/20">
            <p className="text-gray-400 text-lg">Nenhum post publicado ainda</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group rounded-2xl bg-zinc-900 border border-lime-500/20 hover:border-lime-400/50 overflow-hidden transition-all cursor-pointer"
                  onClick={() => onSelectPost?.(post.id)}
                >
                  <div className="aspect-video overflow-hidden">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-lime-400/10 text-lime-400 text-xs font-semibold rounded-full mb-4">
                      {post.category}
                    </span>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-lime-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{post.author || 'Ediliano Souza'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{formatDate(post.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{calculateReadTime(post.excerpt)}</span>
                      </div>
                    </div>

                    <button className="flex items-center gap-2 text-lime-400 text-sm font-medium group-hover:gap-3 transition-all">
                      Ler mais <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center items-center gap-2"
              >
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-white transition-all flex items-center justify-center"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      page === currentPage
                        ? 'bg-lime-400 text-black'
                        : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-white transition-all flex items-center justify-center"
                >
                  <ChevronRight size={20} />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}