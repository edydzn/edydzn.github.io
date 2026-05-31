import { motion } from 'motion/react';
import { Mail, Calendar, User, MessageSquare, RefreshCw, AlertCircle, LogOut, MessageCircle, Trash2, Download, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logoImage from '../../imports/logo_ediliano_designer_branco_e_verde.png';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  timestamp: number;
  createdAt: string;
  status: string;
}

interface ContactAdminProps {
  onLogout?: () => void;
  onBack?: () => void;
}

export function ContactAdmin({ onLogout, onBack }: ContactAdminProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/contacts`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessages(data.contacts || []);
      } else {
        setError(data.error || 'Erro ao carregar mensagens');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'Pendente':
        return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30';
      case 'in_progress':
      case 'Em Atendimento':
        return 'bg-blue-400/10 text-blue-400 border-blue-400/30';
      case 'completed':
      case 'Finalizado':
        return 'bg-green-400/10 text-green-400 border-green-400/30';
      case 'new':
        return 'bg-lime-400/10 text-lime-400 border-lime-400/30';
      default:
        return 'bg-gray-400/10 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Nova';
      case 'pending':
        return 'Pendente';
      case 'in_progress':
        return 'Em Atendimento';
      case 'completed':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/contacts/${messageId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        // Update local state
        setMessages(messages.map(m => 
          m.id === messageId ? { ...m, status: newStatus } : m
        ));
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao atualizar status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/contacts/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        // Remove from local state
        setMessages(messages.filter(m => m.id !== messageId));
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao excluir mensagem');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Erro ao conectar com o servidor');
    }
  };

  const exportToPDF = async () => {
    try {
      // Using jsPDF for PDF generation
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text('Mensagens de Contato', 20, 20);
      
      doc.setFontSize(10);
      let yPos = 40;
      
      messages.forEach((msg, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${msg.name}`, 20, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Email: ${msg.email}`, 25, yPos);
        yPos += 5;
        if (msg.phone) {
          doc.text(`Telefone: ${msg.phone}`, 25, yPos);
          yPos += 5;
        }
        doc.text(`Assunto: ${msg.subject}`, 25, yPos);
        yPos += 5;
        doc.text(`Status: ${getStatusLabel(msg.status)}`, 25, yPos);
        yPos += 5;
        doc.text(`Data: ${formatDate(msg.timestamp)}`, 25, yPos);
        yPos += 5;
        
        const message = doc.splitTextToSize(`Mensagem: ${msg.message}`, 160);
        doc.text(message, 25, yPos);
        yPos += (message.length * 5) + 10;
      });
      
      doc.save(`mensagens_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Erro ao gerar PDF');
    }
  };

  const exportToExcel = () => {
    // Generate CSV (compatible with Excel)
    const headers = ['Nome', 'Email', 'Telefone', 'Assunto', 'Status', 'Data', 'Mensagem'];
    const rows = messages.map(msg => [
      msg.name,
      msg.email,
      msg.phone || 'N/A',
      msg.subject,
      getStatusLabel(msg.status),
      formatDate(msg.timestamp),
      msg.message.replace(/\n/g, ' '),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mensagens_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminAuthTime');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <section className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-3 rounded-xl font-semibold hover:bg-zinc-700 transition-all"
                >
                  <ArrowLeft size={18} />
                  Voltar
                </button>
              )}
              <h2 className="text-4xl md:text-6xl font-bold">
                <span className="text-lime-400">Mensagens</span> de Contato
              </h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {messages.length > 0 && (
                <>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-400 transition-all text-sm"
                  >
                    <Download size={16} />
                    Exportar PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-500 transition-all text-sm"
                  >
                    <FileSpreadsheet size={16} />
                    Exportar Excel
                  </button>
                </>
              )}
              <button
                onClick={fetchMessages}
                disabled={isLoading}
                className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                Atualizar
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-400 transition-all"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-lg">
            Total de mensagens recebidas: <span className="text-lime-400 font-bold">{messages.length}</span>
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-400"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw size={40} className="animate-spin text-lime-400 mx-auto mb-4" />
            <p className="text-gray-400">Carregando mensagens...</p>
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-zinc-900 rounded-2xl border border-lime-400/20"
          >
            <Mail size={60} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhuma mensagem recebida ainda</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-zinc-900 border border-lime-400/20 rounded-2xl p-6 hover:border-lime-400/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-lime-400/10 flex items-center justify-center">
                        <User size={18} className="text-lime-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{msg.name}</h3>
                        <div className="flex flex-col gap-1">
                          <a href={`mailto:${msg.email}`} className="text-sm text-gray-400 hover:text-lime-400 transition-colors">
                            {msg.email}
                          </a>
                          {msg.phone && (
                            <a href={`tel:${msg.phone}`} className="text-sm text-gray-400 hover:text-lime-400 transition-colors">
                              {msg.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={14} />
                    {formatDate(msg.timestamp)}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={16} className="text-lime-400" />
                    <span className="font-semibold text-lime-400">{msg.subject}</span>
                  </div>
                  <p className="text-gray-300 pl-6 whitespace-pre-wrap">{msg.message}</p>
                </div>

                {/* Status Controls */}
                <div className="mb-4 p-3 bg-black/30 rounded-xl">
                  <p className="text-xs text-gray-400 mb-2">Alterar Status:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange(msg.id, 'pending')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        msg.status === 'pending'
                          ? 'bg-yellow-400 text-black'
                          : 'bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20'
                      }`}
                    >
                      Pendente
                    </button>
                    <button
                      onClick={() => handleStatusChange(msg.id, 'in_progress')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        msg.status === 'in_progress'
                          ? 'bg-blue-400 text-black'
                          : 'bg-blue-400/10 text-blue-400 hover:bg-blue-400/20'
                      }`}
                    >
                      Em Atendimento
                    </button>
                    <button
                      onClick={() => handleStatusChange(msg.id, 'completed')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        msg.status === 'completed'
                          ? 'bg-green-400 text-black'
                          : 'bg-green-400/10 text-green-400 hover:bg-green-400/20'
                      }`}
                    >
                      Finalizado
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-lime-400/10">
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(msg.status)}`}>
                    {getStatusLabel(msg.status)}
                  </span>
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                    className="text-sm text-lime-400 hover:text-lime-300 transition-colors"
                  >
                    Responder via Email →
                  </a>
                  {msg.phone && (
                    <a
                      href={`https://wa.me/${msg.phone.replace(/\D/g, '')}?text=Olá ${encodeURIComponent(msg.name)}! Recebi sua mensagem: "${encodeURIComponent(msg.subject)}".`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-400 transition-colors"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Logo no rodapé */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <img src={logoImage} alt="Ediliano Designer" className="h-6 opacity-40 hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>
    </section>
  );
}