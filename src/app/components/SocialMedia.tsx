import { motion } from 'motion/react';
import { Instagram, Globe, ExternalLink, Heart, MessageCircle, Github, Cloud } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from '../../imports/logo_ediliano_designer_branco_e_verde.png';

export function SocialMedia() {
  const instagramPost = {
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    likes: 324,
    comments: 28,
    caption: 'Novo projeto de identidade visual finalizado! 🎨✨',
  };

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/edilianodesigner',
      followers: '2.5k',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Behance',
      icon: Globe,
      url: 'https://behance.net/edilianodesigner',
      followers: '1.2k',
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/edilianodesigner',
      followers: '500',
      color: 'from-gray-500 to-gray-700',
    },
  ];

  return (
    <section className="py-32 px-4 relative overflow-hidden" id="redes-sociais">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Me Acompanhe nas <span className="text-lime-400">Redes Sociais</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Fique por dentro dos meus últimos projetos, dicas de design e bastidores do meu trabalho
          </p>
          <div className="w-20 h-1 bg-lime-400 mx-auto rounded-full mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Instagram Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-lime-400/20 rounded-3xl p-6 hover:border-lime-400/40 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Instagram className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">@edilianodesigner</h3>
                  <p className="text-sm text-gray-400">Post mais recente</p>
                </div>
                <a
                  href="https://instagram.com/edilianodesigner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-lime-400/10 flex items-center justify-center hover:bg-lime-400 hover:text-black transition-all"
                >
                  <ExternalLink size={18} />
                </a>
              </div>

              <div className="relative rounded-2xl overflow-hidden mb-4 aspect-square">
                <ImageWithFallback
                  src={instagramPost.image}
                  alt="Instagram post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Heart size={20} className="hover:text-red-500 transition-colors cursor-pointer" />
                    <span className="text-sm font-medium">{instagramPost.likes}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageCircle size={20} className="hover:text-lime-400 transition-colors cursor-pointer" />
                    <span className="text-sm font-medium">{instagramPost.comments}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{instagramPost.caption}</p>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="block group"
              >
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-lime-400/20 rounded-2xl p-6 hover:border-lime-400/60 hover:shadow-lg hover:shadow-lime-400/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${social.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <social.icon className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-lime-400 transition-colors">
                        {social.name}
                      </h3>
                      <p className="text-gray-400">{social.followers} seguidores</p>
                    </div>
                    <ExternalLink 
                      size={24} 
                      className="text-gray-400 group-hover:text-lime-400 group-hover:translate-x-1 transition-all" 
                    />
                  </div>
                </div>
              </motion.a>
            ))}

            {/* CTA */}
            <div className="bg-gradient-to-br from-lime-400/10 to-lime-400/5 border border-lime-400/30 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Vamos Conectar?</h3>
              <p className="text-gray-400 mb-6">
                Siga meu trabalho e fique por dentro das novidades do mundo do design
              </p>
              <a
                href="https://instagram.com/edilianodesigner"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all"
              >
                <Instagram size={20} />
                Seguir no Instagram
              </a>
            </div>
          </motion.div>
        </div>

        {/* Website Credits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-br from-zinc-900/50 to-black/50 border border-lime-400/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6">
              <img src={logoImage} alt="Ediliano Designer" className="h-10 md:h-12 opacity-90" />
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  Site desenvolvido por <span className="text-lime-400">Ediliano Souza</span>
                </h3>
                <p className="text-gray-400 text-sm md:text-base">
                  Utilizando tecnologias modernas e integração profissional
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                {/* GitHub Badge */}
                <div className="flex items-center gap-3 bg-black/50 border border-gray-700 rounded-xl px-4 py-3 hover:border-lime-400/50 transition-all group">
                  <Github size={24} className="text-gray-400 group-hover:text-lime-400 transition-colors" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Versionado com</p>
                    <p className="text-sm font-semibold text-white">GitHub</p>
                  </div>
                </div>

                {/* Supabase Badge */}
                <div className="flex items-center gap-3 bg-black/50 border border-gray-700 rounded-xl px-4 py-3 hover:border-lime-400/50 transition-all group">
                  <svg 
                    viewBox="0 0 109 113" 
                    className="w-6 h-6 group-hover:opacity-100 opacity-80 transition-opacity"
                    fill="none"
                  >
                    <path 
                      d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" 
                      fill="url(#paint0_linear)" 
                    />
                    <path 
                      d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" 
                      fill="url(#paint1_linear)" 
                      fillOpacity="0.2" 
                    />
                    <path 
                      d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" 
                      fill="#3ECF8E" 
                    />
                    <defs>
                      <linearGradient 
                        id="paint0_linear" 
                        x1="53.9738" 
                        y1="54.974" 
                        x2="94.1635" 
                        y2="71.8295" 
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#249361" />
                        <stop offset="1" stopColor="#3ECF8E" />
                      </linearGradient>
                      <linearGradient 
                        id="paint1_linear" 
                        x1="36.1558" 
                        y1="30.578" 
                        x2="54.4844" 
                        y2="65.0806" 
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop />
                        <stop offset="1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Backend com</p>
                    <p className="text-sm font-semibold text-white">Supabase</p>
                  </div>
                </div>

                {/* Cloudflare Badge */}
                <div className="flex items-center gap-3 bg-black/50 border border-gray-700 rounded-xl px-4 py-3 hover:border-lime-400/50 transition-all group">
                  <Cloud size={24} className="text-[#F38020] group-hover:text-[#F6821F] transition-colors" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Hospedado em</p>
                    <p className="text-sm font-semibold text-white">Cloudflare</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                © {new Date().getFullYear()} Ediliano Designer. Todos os direitos reservados.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}