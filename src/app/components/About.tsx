import { motion } from 'motion/react';
import { Award, MapPin, Briefcase, Code2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const profileImage =
  'https://i.postimg.cc/d3vSSC7L/b26758226dc0507ebf730b3eabbc1a06b3760b4b.png';

export function About() {
  const tools = [
    { name: 'Adobe Photoshop', category: 'Adobe Suite' },
    { name: 'Adobe Illustrator', category: 'Adobe Suite' },
    { name: 'After Effects', category: 'Adobe Suite' },
    { name: 'Affinity Studio', category: 'Design' },
    { name: 'Ink Scape', category: 'Design' },
    { name: 'Corel Draw', category: 'Design' },
    { name: 'Figma', category: 'UI/UX' },
    { name: 'Canva', category: 'Design' },
  ];

  return (
    <section className="min-h-screen py-32 px-4" id="sobre">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Quem <span className="text-lime-400">Sou Eu?</span>
          </h2>
          <div className="w-20 h-1 bg-lime-400 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Profile Photo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-br from-lime-400/20 to-lime-400/5 rounded-3xl blur-2xl" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-lime-400/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-lime-400/20 rounded-full blur-3xl" />
              
              {/* Profile Image */}
              <div className="relative rounded-2xl overflow-hidden border-4 border-lime-400/30 shadow-2xl">
                <ImageWithFallback
                  src={profileImage}
                  alt="Ediliano Designer - Designer Gráfico"
                  className="w-full h-auto object-cover"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              {/* Info Cards Overlay */}
              <div className="absolute -bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-black/90 backdrop-blur-sm border border-lime-400/30">
                  <Briefcase className="text-lime-400" size={20} />
                  <p className="text-xs text-gray-400">Experiência</p>
                  <p className="text-sm font-bold">+8 Anos</p>
                </div>

                <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-black/90 backdrop-blur-sm border border-lime-400/30">
                  <MapPin className="text-lime-400" size={20} />
                  <p className="text-xs text-gray-400">Localização</p>
                  <p className="text-sm font-bold">Itapicuru, BA</p>
                </div>

                <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-black/90 backdrop-blur-sm border border-lime-400/30">
                  <Award className="text-lime-400" size={20} />
                  <p className="text-xs text-gray-400">Especialidade</p>
                  <p className="text-sm font-bold text-center leading-tight">Design Gráfico</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 lg:pt-0 pt-12"
          >
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Ediliano <span className="text-lime-400">Souza</span>
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Designer Gráfico brasileiro, residente na cidade de Itapicuru-BA, com mais de 
                <span className="text-lime-400 font-semibold"> 8 anos de experiência</span> transformando 
                ideias em projetos visuais impactantes e memoráveis.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Ao longo da minha carreira, desenvolvi expertise em diversas ferramentas profissionais 
                de design, sempre buscando entregar resultados que superem as expectativas dos meus clientes.
              </p>
            </div>

            {/* Tools Section */}
            <div className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Code2 className="text-lime-400" size={24} />
                <h4 className="text-xl font-bold">Ferramentas que Domino</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {tools.map((tool, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-lime-400/5 border border-lime-400/20 hover:bg-lime-400/10 hover:border-lime-400/40 transition-all group"
                  >
                    <div className="w-2 h-2 rounded-full bg-lime-400 group-hover:scale-125 transition-transform" />
                    <span className="text-sm font-medium">{tool.name}</span>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: tools.length * 0.05 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-lime-400/5 border border-lime-400/20 hover:bg-lime-400/10 hover:border-lime-400/40 transition-all group"
                >
                  <div className="w-2 h-2 rounded-full bg-lime-400 group-hover:scale-125 transition-transform" />
                  <span className="text-sm font-medium">E outras...</span>
                </motion.div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="#portfolio"
                className="inline-flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all"
              >
                Ver Portfólio
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}