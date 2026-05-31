import { motion } from 'motion/react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BlogProps {
  onSelectPost?: (postId: number) => void;
}

const blogPosts = [
  {
    id: 1,
    title: 'Tendências de Design Gráfico para 2026',
    excerpt: 'Descubra as principais tendências que estão moldando o futuro do design gráfico e como aplicá-las em seus projetos.',
    image: 'https://images.unsplash.com/photo-1710799885122-428e63eff691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjB0cmVuZHMlMjBhcnRpY2xlfGVufDF8fHx8MTc2ODk1MzU2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '15 Jan 2026',
    readTime: '5 min',
    category: 'Tendências',
  },
  {
    id: 2,
    title: 'A Psicologia das Cores no Branding',
    excerpt: 'Entenda como as cores influenciam a percepção da sua marca e como escolher a paleta perfeita para seu negócio.',
    image: 'https://images.unsplash.com/photo-1616699732508-c5dd7a8f6e12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvciUyMHRoZW9yeSUyMGRlc2lnbnxlbnwxfHx8fDE3Njg5Mjc5ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    date: '10 Jan 2026',
    readTime: '7 min',
    category: 'Design Theory',
  },
  {
    id: 3,
    title: 'Como Criar um Ambiente Criativo Produtivo',
    excerpt: 'Dicas práticas para organizar seu workspace e maximizar sua criatividade e produtividade no dia a dia.',
    image: 'https://images.unsplash.com/photo-1746440160680-2c50206e568a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGluc3BpcmF0aW9uJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2ODk1MzU2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '5 Jan 2026',
    readTime: '4 min',
    category: 'Produtividade',
  },
  {
    id: 4,
    title: 'Minimalismo vs. Maximalismo: Qual Escolher?',
    excerpt: 'Explorando dois estilos opostos de design e quando cada um deles é mais apropriado para seu projeto.',
    image: 'https://images.unsplash.com/photo-1681694826758-5d7cec6215e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dvJTIwZGVzaWduJTIwbW9ja3VwfGVufDF8fHx8MTc2ODgzOTc2OHww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '28 Dez 2025',
    readTime: '6 min',
    category: 'Estilos',
  },
  {
    id: 5,
    title: 'Tipografia: A Arte de Escolher Fontes',
    excerpt: 'Aprenda os fundamentos da tipografia e como selecionar as combinações de fontes perfeitas para seus designs.',
    image: 'https://images.unsplash.com/photo-1505356822725-08ad25f3ffe4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0eXBvZ3JhcGh5JTIwYXJ0fGVufDF8fHx8MTc2ODkyNjI1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '20 Dez 2025',
    readTime: '8 min',
    category: 'Tipografia',
  },
  {
    id: 6,
    title: 'Design Sustentável: O Futuro é Verde',
    excerpt: 'Como incorporar práticas sustentáveis no design gráfico e criar projetos mais conscientes ambientalmente.',
    image: 'https://images.unsplash.com/photo-1748765968965-7e18d4f7192b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHBhY2thZ2luZyUyMGRlc2lnbnxlbnwxfHx8fDE3Njg5NTM1MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    date: '15 Dez 2025',
    readTime: '5 min',
    category: 'Sustentabilidade',
  },
];

export function Blog({ onSelectPost }: BlogProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
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

                <h3 className="text-xl font-bold mb-3 group-hover:text-lime-400 transition-colors">
                  {post.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <button className="flex items-center gap-2 text-lime-400 text-sm font-medium group-hover:gap-3 transition-all">
                  Ler mais <ArrowRight size={16} />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}