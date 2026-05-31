import { motion } from 'motion/react';
import { Palette, Layout, Package, Megaphone, FileText, Sparkles } from 'lucide-react';

interface ServicesProps {
  onRequestQuote?: () => void;
}

const services = [
  {
    icon: Palette,
    title: 'Identidade Visual',
    description: 'Criação de logos, paletas de cores e guias de estilo completos para sua marca se destacar.',
    features: ['Logotipo', 'Manual da Marca', 'Papelaria', 'Assinatura de Email'],
  },
  {
    icon: Layout,
    title: 'UI/UX Design',
    description: 'Interfaces digitais intuitivas e atraentes que proporcionam experiências memoráveis.',
    features: ['Design de Apps', 'Websites', 'Dashboards', 'Prototipagem'],
  },
  {
    icon: Package,
    title: 'Design de Embalagem',
    description: 'Embalagens criativas que contam histórias e conquistam consumidores nas prateleiras.',
    features: ['Rótulos', 'Caixas', 'Sacolas', 'Mockups 3D'],
  },
  {
    icon: Megaphone,
    title: 'Material Marketing',
    description: 'Peças gráficas impactantes para campanhas de marketing digital e impresso.',
    features: ['Posts Redes Sociais', 'Banners', 'Flyers', 'Apresentações'],
  },
  {
    icon: FileText,
    title: 'Editorial',
    description: 'Design editorial profissional para publicações impressas e digitais.',
    features: ['Revistas', 'E-books', 'Catálogos', 'Infográficos'],
  },
  {
    icon: Sparkles,
    title: 'Consultoria de Design',
    description: 'Orientação estratégica para elevar a qualidade visual da sua marca.',
    features: ['Análise de Marca', 'Estratégia Visual', 'Workshops', 'Mentoria'],
  },
];

export function Services({ onRequestQuote }: ServicesProps) {
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
            <span className="text-lime-400">Serviços</span> Oferecidos
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Soluções completas de design gráfico para transformar sua marca e impulsionar seus resultados
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-8 rounded-2xl bg-zinc-900 border border-lime-500/20 hover:border-lime-400 hover:bg-zinc-800/50 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-lime-400/10 flex items-center justify-center mb-6 group-hover:bg-lime-400/20 transition-colors">
                  <Icon className="text-lime-400" size={28} />
                </div>

                <h3 className="text-2xl font-bold mb-3 group-hover:text-lime-400 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-400 mb-6">
                  {service.description}
                </p>

                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-lime-400/10 to-lime-400/5 border border-lime-400/30">
            <p className="text-lg mb-4">
              Não encontrou o que procura?
            </p>
            <p className="text-gray-400 mb-6">
              Entre em contato para discutirmos seu projeto específico
            </p>
            <button 
              onClick={onRequestQuote}
              className="bg-lime-400 text-black px-8 py-3 rounded-full font-semibold hover:bg-lime-300 transition-colors"
            >
              Solicitar Orçamento
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}