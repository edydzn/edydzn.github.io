import { motion } from 'motion/react';
import { Mail, Briefcase, LogOut, Shield, MessageSquare, FileText, Users, BookOpen, Calendar as CalendarIcon, ShoppingBag, CalendarDays, CreditCard } from 'lucide-react';
import logoImage from '../../imports/logo_ediliano_designer_branco_e_verde.png';

interface AdminDashboardProps {
  onSelectView: (view: 'messages' | 'quotes' | 'leads' | 'blog' | 'calendar' | 'portfolio' | 'store' | 'strategic-calendar' | 'subscriptions') => void;
  onLogout: () => void;
}

export function AdminDashboard({ onSelectView, onLogout }: AdminDashboardProps) {
  const cards = [
    {
      id: 'store' as const,
      title: 'Gerenciar Creator',
      description: 'Adicione produtos, gerencie categorias e visualize estatísticas de vendas',
      icon: ShoppingBag,
      color: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      id: 'strategic-calendar' as const,
      title: 'Calendário Estratégico',
      description: 'Gerencie datas comemorativas, etiquetas e vincule artes da Creator',
      icon: CalendarDays,
      color: 'from-lime-500/20 to-lime-500/5',
      borderColor: 'border-lime-500/30 hover:border-lime-500/60',
      iconColor: 'text-lime-400',
      bgColor: 'bg-lime-400/10',
    },
    {
      id: 'subscriptions' as const,
      title: 'Assinaturas & Usuários',
      description: 'Gerencie usuários, status de assinatura, pagamentos MP e renovações',
      icon: CreditCard,
      color: 'from-cyan-500/20 to-cyan-500/5',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500/60',
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
    },
    {
      id: 'calendar' as const,
      title: 'Calendário de Conteúdo',
      description: 'Visualize e agende seus posts mensais para redes sociais',
      icon: CalendarIcon,
      color: 'from-pink-500/20 to-pink-500/5',
      borderColor: 'border-pink-500/30 hover:border-pink-500/60',
      iconColor: 'text-pink-400',
      bgColor: 'bg-pink-400/10',
    },
    {
      id: 'portfolio' as const,
      title: 'Gerenciar Portfólio',
      description: 'Adicione, edite e destaque projetos em seu portfólio',
      icon: Briefcase,
      color: 'from-yellow-500/20 to-yellow-500/5',
      borderColor: 'border-yellow-500/30 hover:border-yellow-500/60',
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      id: 'messages' as const,
      title: 'Mensagens de Contato',
      description: 'Visualize e gerencie todas as mensagens recebidas através do formulário de contato',
      icon: MessageSquare,
      color: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60',
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      id: 'quotes' as const,
      title: 'Solicitações de Orçamento',
      description: 'Gerencie todas as solicitações de orçamento e propostas de projetos',
      icon: FileText,
      color: 'from-lime-500/20 to-lime-500/5',
      borderColor: 'border-lime-500/30 hover:border-lime-500/60',
      iconColor: 'text-lime-400',
      bgColor: 'bg-lime-400/10',
    },
    {
      id: 'leads' as const,
      title: 'Leads Capturados',
      description: 'Gerencie todos os leads de contatos capturados e exporte para seus dispositivos',
      icon: Users,
      color: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      id: 'blog' as const,
      title: 'Gerenciar Blog',
      description: 'Crie, edite e gerencie todos os posts do blog do site',
      icon: BookOpen,
      color: 'from-orange-500/20 to-orange-500/5',
      borderColor: 'border-orange-500/30 hover:border-orange-500/60',
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
  ];

  return (
    <div className="min-h-screen bg-black px-4 py-32">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center">
              <Shield size={32} className="text-lime-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Painel <span className="text-lime-400">Administrativo</span>
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Escolha o que deseja gerenciar
          </p>
          
          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onLogout}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Sair do Painel
          </motion.button>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => onSelectView(card.id)}
              className={`relative group bg-zinc-900 border-2 ${card.borderColor} rounded-2xl p-8 text-left transition-all hover:scale-105 hover:shadow-2xl overflow-hidden`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className={`w-16 h-16 ${card.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <card.icon size={32} className={card.iconColor} />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-white">
                  {card.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed mb-4">
                  {card.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 group-hover:text-lime-400 transition-colors">
                  Acessar
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-lime-400/5 rounded-full blur-3xl" />
            </motion.button>
          ))}
        </div>

        {/* Logo no rodapé */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 flex justify-center"
        >
          <img src={logoImage} alt="Ediliano Designer" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>
    </div>
  );
}