import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Instagram, Linkedin, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/contact`,
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
          message: data.message || 'Mensagem enviada com sucesso!',
        });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus({ type: null, message: '' });
        }, 5000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Erro ao enviar mensagem. Tente novamente.',
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Erro ao enviar mensagem. Verifique sua conexão e tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
            Vamos <span className="text-lime-400">Conversar?</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tem um projeto em mente? Entre em contato e vamos transformar suas ideias em realidade
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6">Informações de Contato</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-lime-400/20 transition-colors">
                    <Mail className="text-lime-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Email</p>
                    <a href="mailto:contato@edilianodesigner.com.br" className="text-gray-400 hover:text-lime-400 transition-colors">
                      contato@edilianodesigner.com.br
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-lime-400/20 transition-colors">
                    <Phone className="text-lime-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Telefone</p>
                    <a href="tel:+5575936184057" className="text-gray-400 hover:text-lime-400 transition-colors">
                      +55 (75) 93618-4057
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-lime-400/20 transition-colors">
                    <MapPin className="text-lime-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Localização</p>
                    <p className="text-gray-400">
                      Itapicuru, BA, Brasil
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Redes Sociais</h3>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/edilianodesigner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center hover:bg-lime-400 hover:text-black transition-all"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center hover:bg-lime-400 hover:text-black transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="https://behance.net/edilianodesigner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center hover:bg-lime-400 hover:text-black transition-all"
                  aria-label="Behance"
                >
                  <Globe size={20} />
                </a>
        
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-lime-400/10 to-lime-400/5 border border-lime-400/30">
              <h4 className="font-bold mb-2">Horário de Atendimento</h4>
              <p className="text-sm text-gray-400">
                Segunda a Sexta: 9h às 18h<br />
                Sábado: 9h às 13h
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
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
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                  placeholder="(XX) XXXX-XXXX"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Assunto *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                  placeholder="Como posso ajudar?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-lime-500/20 focus:border-lime-400 focus:outline-none transition-colors text-white resize-none"
                  placeholder="Conte-me sobre seu projeto..."
                />
              </div>

              {submitStatus.type === 'success' && (
                <div className="flex items-center text-sm text-green-500">
                  <CheckCircle size={16} className="mr-2" />
                  {submitStatus.message}
                </div>
              )}

              {submitStatus.type === 'error' && (
                <div className="flex items-center text-sm text-red-500">
                  <AlertCircle size={16} className="mr-2" />
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-lime-400 text-black px-8 py-4 rounded-xl font-semibold hover:bg-lime-300 transition-all flex items-center justify-center gap-2 group"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                <Send size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}