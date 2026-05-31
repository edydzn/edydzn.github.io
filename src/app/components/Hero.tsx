import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  setActiveSection: (section: string) => void;
}

export function Hero({ setActiveSection }: HeroProps) {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Sparkles className="text-lime-400" size={20} />
            <span className="text-lime-400 text-sm font-medium tracking-wider uppercase">
              Design Gráfico Profissional
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Transformo <span className="text-lime-400">Ideias</span> em
            <br />
            Designs <span className="text-lime-400">Incríveis</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            Sou Ediliano, designer gráfico especializado em criar identidades visuais únicas
            e impactantes que elevam marcas ao próximo nível.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => setActiveSection('portfolio')}
              className="group bg-lime-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-lime-300 transition-all flex items-center justify-center gap-2"
            >
              Ver Portfólio
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveSection('contact')}
              className="border-2 border-lime-400 text-lime-400 px-8 py-4 rounded-full font-semibold hover:bg-lime-400 hover:text-black transition-all"
            >
              Entrar em Contato
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
          >
            <div>
              <div className="text-3xl md:text-4xl font-bold text-lime-400 mb-2">150+</div>
              <div className="text-sm text-gray-400">Projetos</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-lime-400 mb-2">100+</div>
              <div className="text-sm text-gray-400">Clientes</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-lime-400 mb-2">8+</div>
              <div className="text-sm text-gray-400">Anos</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}