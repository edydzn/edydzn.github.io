import { motion } from 'motion/react';
import { FileText, Clock, ShieldCheck } from 'lucide-react';
import { QuoteForm } from './QuoteForm';

interface QuotePageProps {
  onBack: () => void;
}

export function QuotePage({ onBack }: QuotePageProps) {
  return (
    <section className="min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Solicite seu <span className="text-lime-400">Orçamento</span>
          </h1>
          <div className="w-20 h-1 bg-lime-400 mx-auto rounded-full mb-6" />
          <p className="text-gray-400 max-w-2xl mx-auto">
            Conte sobre o seu projeto. Receberei sua solicitação no painel administrativo
            e retornarei com uma proposta personalizada o mais breve possível.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: FileText,
              title: 'Briefing Detalhado',
              text: 'Quanto mais detalhes, mais precisa será a proposta.',
            },
            {
              icon: Clock,
              title: 'Resposta Rápida',
              text: 'Retorno em até 24 horas úteis no e-mail informado.',
            },
            {
              icon: ShieldCheck,
              title: 'Sem Compromisso',
              text: 'A solicitação é gratuita e sem compromisso de fechamento.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 p-5 rounded-2xl bg-zinc-900/50 border border-lime-400/10"
            >
              <item.icon className="text-lime-400 shrink-0" size={22} />
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-sm text-gray-400">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <QuoteForm onBack={onBack} />
      </div>
    </section>
  );
}
