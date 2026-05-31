import { motion } from 'motion/react';
import { Send, ArrowLeft, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface QuoteFormProps {
  onBack: () => void;
}

export function QuoteForm({ onBack }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    deadline: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const services = [
    'Identidade Visual',
    'UI/UX Design',
    'Design de Embalagem',
    'Material Marketing',
    'Editorial',
    'Consultoria de Design',
    'Outro',
  ];

  const budgetRanges = [
    'Até R$ 1.000',
    'R$ 1.000 - R$ 3.000',
    'R$ 3.000 - R$ 5.000',
    'R$ 5.000 - R$ 10.000',
    'Acima de R$ 10.000',
    'A definir',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/quote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Orçamento enviado com sucesso!',
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: '',
          budget: '',
          deadline: '',
          description: '',
        });

        // Redirect back after 3 seconds
        setTimeout(() => {
          onBack();
        }, 3000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Erro ao enviar orçamento. Tente novamente.',
        });
      }
    } catch (error) {
      console.error('Error submitting quote form:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Erro ao enviar orçamento. Verifique sua conexão e tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onBack}
          className="flex items-center gap-2 text-lime-400 hover:text-lime-300 mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para Serviços
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lime-400/10 mb-6">
            <Briefcase className="text-lime-400" size={32} />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Solicitar <span className="text-lime-400">Orçamento</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Preencha o formulário abaixo com os detalhes do seu projeto e entrarei em contato com uma proposta personalizada
          </p>
        </motion.div>

        {/* Success/Error Message */}
        {submitStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              submitStatus.type === 'success'
                ? 'bg-lime-400/10 border border-lime-400/50 text-lime-400'
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}
          >
            {submitStatus.type === 'success' ? (
              <CheckCircle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            <div>
              <p className="font-semibold">{submitStatus.message}</p>
              {submitStatus.type === 'success' && (
                <p className="text-sm mt-1 text-gray-400">
                  Você será redirecionado em instantes...
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6 bg-zinc-900 border border-lime-400/20 rounded-2xl p-8"
        >
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-black border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-black border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Telefone/WhatsApp *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-black border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                Empresa/Marca
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-black border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                placeholder="Nome da empresa (opcional)"
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="pt-6 border-t border-lime-400/10">
            <h3 className="text-xl font-bold mb-6 text-lime-400">Detalhes do Projeto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="service" className="block text-sm font-medium mb-2">
                  Tipo de Serviço *
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium mb-2">
                  Orçamento Estimado *
                </label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                >
                  <option value="">Selecione uma faixa</option>
                  {budgetRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="deadline" className="block text-sm font-medium mb-2">
                Prazo Desejado
              </label>
              <input
                type="text"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-black border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                placeholder="Ex: 2 semanas, 1 mês, urgente..."
              />
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Descrição do Projeto *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-black border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white resize-none"
                placeholder="Descreva seu projeto, objetivos, público-alvo, referências e qualquer outra informação relevante..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-lime-400/10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-lime-400 text-black px-8 py-4 rounded-xl font-semibold hover:bg-lime-300 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  Enviando...
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                <>
                  Enviar Solicitação
                  <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-sm text-gray-400 mt-4">
              Responderei em até 24 horas úteis
            </p>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
