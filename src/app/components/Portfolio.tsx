import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  link?: string;
  featured: boolean;
}

const fallbackItems = [
  {
    id: '1',
    title: 'Identidade Visual Corporativa',
    category: 'Branding',
    image: 'https://images.unsplash.com/photo-1681694826758-5d7cec6215e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dvJTIwZGVzaWduJTIwbW9ja3VwfGVufDF8fHx8MTc2ODgzOTc2OHww&ixlib=rb-4.1.0&q=80&w=1080',
    link: '',
    featured: false
  },
  {
    id: '2',
    title: 'Design de Embalagem Premium',
    category: 'Packaging',
    image: 'https://images.unsplash.com/photo-1748765968965-7e18d4f7192b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHBhY2thZ2luZyUyMGRlc2lnbnxlbnwxfHx8fDE3Njg5NTM1MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    link: '',
    featured: false
  },
  {
    id: '3',
    title: 'Campanha Visual Digital',
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1763671727638-5bc55bb9c980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBicmFuZGluZyUyMHBvc3RlcnxlbnwxfHx8fDE3Njg4Njc5Njd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    link: '',
    featured: false
  },
];

export function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/portfolio`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        const data = await res.json();
        
        if (data.success) {
          if (data.items && data.items.length > 0) {
            setItems(data.items);
          } else {
            // If no items in DB, show fallback for demo purposes so the site isn't empty
            // Ideally, we would show an empty state, but for a template/demo, fallback is better.
            setItems(fallbackItems);
          }
        } else {
          setItems(fallbackItems);
        }
      } catch (error) {
        console.error("Error loading portfolio:", error);
        setItems(fallbackItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

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
            Meu <span className="text-lime-400">Portfólio</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Conheça alguns dos projetos que transformaram marcas e conquistaram resultados incríveis
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 size={40} className="text-lime-400 animate-spin mb-4" />
            <p className="text-gray-500">Carregando projetos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-lime-500/20 hover:border-lime-400/50 transition-all cursor-pointer shadow-lg hover:shadow-lime-400/10"
              >
                <div className="aspect-square overflow-hidden bg-black">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-3 py-1 bg-lime-400 text-black text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                    
                    {item.link ? (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-lime-400 text-sm font-medium hover:text-lime-300 transition-colors mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver Projeto <ExternalLink size={16} />
                      </a>
                    ) : (
                      <span className="text-gray-500 text-xs mt-2 block">Projeto Interno</span>
                    )}
                  </div>
                </div>
                
                {item.featured && (
                   <div className="absolute top-4 right-4 bg-lime-400 text-black text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
                     Destaque
                   </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}