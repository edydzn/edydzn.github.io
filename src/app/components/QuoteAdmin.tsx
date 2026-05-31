import { motion } from 'motion/react';
import { Briefcase, Calendar, User, Mail, Phone, Building, DollarSign, Clock, FileText, RefreshCw, AlertCircle, LogOut, Trash2, Download, FileSpreadsheet, CheckCircle, ArrowLeft, Plus, X, FilePlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logoImage from 'figma:asset/59e11ba1cc4c86c64bac442ad92df8ca76904c21.png';

interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  deadline: string;
  description: string;
  timestamp: number;
  createdAt: string;
  status: string;
  observations?: string;
  value?: string;
}

interface QuoteAdminProps {
  onLogout?: () => void;
  onBack?: () => void;
}

export function QuoteAdmin({ onLogout, onBack }: QuoteAdminProps) {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<string | null>(null);
  const [quoteDetails, setQuoteDetails] = useState<{[key: string]: {observations: string, value: string}}>({});
  const [newQuote, setNewQuote] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Identidade Visual',
    budget: 'R$ 1.000 - R$ 3.000',
    deadline: '1-2 semanas',
    description: '',
    observations: '',
    value: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchQuotes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/quotes`,
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
        setQuotes(data.quotes || []);
        // Initialize quote details from existing data
        const details: {[key: string]: {observations: string, value: string}} = {};
        data.quotes.forEach((q: QuoteRequest) => {
          details[q.id] = {
            observations: q.observations || '',
            value: q.value || ''
          };
        });
        setQuoteDetails(details);
      } else {
        setError(data.error || 'Erro ao carregar orçamentos');
      }
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
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

  const handleUpdateQuoteDetails = async (quoteId: string) => {
    const details = quoteDetails[quoteId];
    if (!details) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/quotes/${quoteId}/details`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(details),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update local quotes state
        setQuotes(quotes.map(q => 
          q.id === quoteId ? data.quote : q
        ));
        setEditingQuote(null);
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao atualizar detalhes');
      }
    } catch (err) {
      console.error('Error updating quote details:', err);
      setError('Erro ao conectar com o servidor');
    }
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
      default:
        return 'bg-gray-400/10 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
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

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/quotes/${quoteId}/status`,
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
        setQuotes(quotes.map(q => 
          q.id === quoteId ? { ...q, status: newStatus } : q
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

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta solicitação de orçamento?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/quotes/${quoteId}`,
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
        setQuotes(quotes.filter(q => q.id !== quoteId));
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao excluir solicitação');
      }
    } catch (err) {
      console.error('Error deleting quote:', err);
      setError('Erro ao conectar com o servidor');
    }
  };

  const exportToPDF = async () => {
    try {
      // Using jsPDF for PDF generation
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text('Solicitações de Orçamento', 20, 20);
      
      doc.setFontSize(10);
      let yPos = 40;
      
      quotes.forEach((quote, index) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${quote.name} - ${quote.company}`, 20, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Email: ${quote.email}`, 25, yPos);
        yPos += 5;
        doc.text(`Telefone: ${quote.phone}`, 25, yPos);
        yPos += 5;
        doc.text(`Serviço: ${quote.service}`, 25, yPos);
        yPos += 5;
        doc.text(`Orçamento: ${quote.budget}`, 25, yPos);
        yPos += 5;
        doc.text(`Prazo: ${quote.deadline}`, 25, yPos);
        yPos += 5;
        doc.text(`Status: ${getStatusLabel(quote.status)}`, 25, yPos);
        yPos += 5;
        doc.text(`Data: ${formatDate(quote.timestamp)}`, 25, yPos);
        yPos += 5;
        
        // Add value if exists
        if (quote.value) {
          doc.setFont(undefined, 'bold');
          doc.text(`Valor do Serviço: ${quote.value}`, 25, yPos);
          doc.setFont(undefined, 'normal');
          yPos += 5;
        }
        
        const description = doc.splitTextToSize(`Descrição: ${quote.description}`, 160);
        doc.text(description, 25, yPos);
        yPos += (description.length * 5);
        
        // Add observations if exists
        if (quote.observations) {
          yPos += 3;
          doc.setFont(undefined, 'bold');
          doc.text('Observações:', 25, yPos);
          doc.setFont(undefined, 'normal');
          yPos += 5;
          const observations = doc.splitTextToSize(quote.observations, 160);
          doc.text(observations, 25, yPos);
          yPos += (observations.length * 5);
        }
        
        yPos += 10;
      });
      
      doc.save(`orcamentos_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Erro ao gerar PDF');
    }
  };

  const exportToExcel = () => {
    // Generate CSV (compatible with Excel)
    const headers = ['Nome', 'Empresa', 'Email', 'Telefone', 'Serviço', 'Orçamento', 'Prazo', 'Status', 'Data', 'Descrição'];
    const rows = quotes.map(quote => [
      quote.name,
      quote.company,
      quote.email,
      quote.phone,
      quote.service,
      quote.budget,
      quote.deadline,
      getStatusLabel(quote.status),
      formatDate(quote.timestamp),
      quote.description.replace(/\n/g, ' '),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orcamentos_${new Date().toISOString().split('T')[0]}.csv`);
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

  const handleBackToDashboard = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, '', '?admin=login');
      window.location.reload();
    }
  };

  const handleCreateQuote = async () => {
    if (!newQuote.name || !newQuote.email || !newQuote.phone || !newQuote.company || !newQuote.description) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/quotes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(newQuote),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setNewQuote({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: 'Identidade Visual',
          budget: 'R$ 1.000 - R$ 3.000',
          deadline: '1-2 semanas',
          description: '',
          observations: '',
          value: '',
        });
        fetchQuotes(); // Refresh the list
      } else {
        setError(data.error || 'Erro ao criar orçamento');
      }
    } catch (err) {
      console.error('Error creating quote:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsSaving(false);
    }
  };

  const generateQuotePDF = async (quote: QuoteRequest) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Add logo
      try {
        const img = new Image();
        img.src = logoImage;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        doc.addImage(img, 'PNG', 15, 10, 60, 15);
      } catch (err) {
        console.error('Error loading logo:', err);
      }

      // Header - Company info
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Ediliano Designer', 150, 15);
      doc.text('Design Gráfico Profissional', 150, 20);
      doc.text('contao@edilianodesigner.com.br', 150, 25);
      doc.text('+55 (75) 93618-4057', 150, 30);
      doc.text('Itapicuru, BA, Brasil', 150, 35);

      // Line separator
      doc.setDrawColor(200);
      doc.line(15, 40, 195, 40);

      // Title
      doc.setFontSize(22);
      doc.setTextColor(0);
      doc.setFont(undefined, 'bold');
      doc.text('ORÇAMENTO', 15, 52);

      // Quote number and date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      doc.text(`Nº: ${quote.id.split('_')[1] || 'N/A'}`, 15, 60);
      doc.text(`Data: ${formatDate(quote.timestamp)}`, 15, 65);
      doc.text(`Status: ${getStatusLabel(quote.status)}`, 15, 70);

      // Client info section
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.setFont(undefined, 'bold');
      doc.text('DADOS DO CLIENTE', 15, 82);

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50);
      doc.text(`Nome: ${quote.name}`, 15, 90);
      doc.text(`Empresa: ${quote.company}`, 15, 96);
      doc.text(`Email: ${quote.email}`, 15, 102);
      doc.text(`Telefone: ${quote.phone}`, 15, 108);

      // Service info section
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.setFont(undefined, 'bold');
      doc.text('DETALHES DO SERVIÇO', 15, 122);

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50);
      doc.text(`Serviço: ${quote.service}`, 15, 130);
      doc.text(`Orçamento: ${quote.budget}`, 15, 136);
      doc.text(`Prazo Estimado: ${quote.deadline}`, 15, 142);

      // Value if exists
      let yPos = 148;
      if (quote.value) {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 128, 0);
        doc.text(`Valor do Serviço: ${quote.value}`, 15, yPos);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50);
        yPos += 6;
      }

      // Description section
      yPos += 8;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.setFont(undefined, 'bold');
      doc.text('DESCRIÇÃO DO PROJETO', 15, yPos);

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50);
      const descriptionLines = doc.splitTextToSize(quote.description, 180);
      yPos += 8;
      doc.text(descriptionLines, 15, yPos);
      yPos += (descriptionLines.length * 5);

      // Observations if exists
      if (quote.observations) {
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text('OBSERVAÇÕES', 15, yPos);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50);
        const observationsLines = doc.splitTextToSize(quote.observations, 180);
        yPos += 8;
        doc.text(observationsLines, 15, yPos);
      }

      // Footer
      const footerY = 270;
      doc.setDrawColor(200);
      doc.line(15, footerY, 195, footerY);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('Este orçamento tem validade de 30 dias a partir da data de emissão.', 105, footerY + 6, { align: 'center' });
      doc.text('Ediliano Designer - Design Gráfico Profissional', 105, footerY + 11, { align: 'center' });
      doc.text('Instagram: @edilianodesigner | Behance: behance.net/edilianodesigner', 105, footerY + 16, { align: 'center' });

      doc.save(`orcamento_${quote.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating quote PDF:', err);
      setError('Erro ao gerar PDF do orçamento');
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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-3 rounded-xl font-semibold hover:bg-zinc-700 transition-all"
              >
                <ArrowLeft size={18} />
                Voltar
              </button>
              <h2 className="text-3xl md:text-5xl font-bold">
                <span className="text-lime-400">Solicitações</span> de Orçamento
              </h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-lime-400 text-black px-5 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all"
              >
                <Plus size={18} />
                Novo Orçamento
              </button>
              {quotes.length > 0 && (
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
                onClick={fetchQuotes}
                disabled={isLoading}
                className="flex items-center gap-2 bg-zinc-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-zinc-600 transition-all disabled:opacity-50 text-sm"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                Atualizar
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-400 transition-all text-sm"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-lg">
            Total de solicitações: <span className="text-lime-400 font-bold">{quotes.length}</span>
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
            <p className="text-gray-400">Carregando solicitações...</p>
          </div>
        ) : quotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-zinc-900 rounded-2xl border border-lime-400/20"
          >
            <Briefcase size={60} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhuma solicitação de orçamento recebida ainda</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-zinc-900 border border-lime-400/20 rounded-2xl p-6 hover:border-lime-400/50 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pb-6 border-b border-lime-400/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-lime-400/10 flex items-center justify-center">
                      <User size={24} className="text-lime-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{quote.name}</h3>
                      <p className="text-sm text-gray-400">{quote.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(quote.status)}`}>
                      {getStatusLabel(quote.status)}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={14} />
                      {formatDate(quote.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-lime-400 flex-shrink-0" />
                    <a href={`mailto:${quote.email}`} className="text-sm hover:text-lime-400 transition-colors truncate">
                      {quote.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-lime-400 flex-shrink-0" />
                    <a href={`tel:${quote.phone}`} className="text-sm hover:text-lime-400 transition-colors">
                      {quote.phone}
                    </a>
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-black/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-lime-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Serviço</p>
                      <p className="text-sm font-semibold">{quote.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign size={18} className="text-lime-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Orçamento</p>
                      <p className="text-sm font-semibold">{quote.budget}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-lime-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Prazo</p>
                      <p className="text-sm font-semibold">{quote.deadline}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-lime-400" />
                    <span className="text-sm font-semibold text-lime-400">Descrição do Projeto</span>
                  </div>
                  <p className="text-gray-300 text-sm pl-6 whitespace-pre-wrap">{quote.description}</p>
                </div>

                {/* Observações e Valor do Serviço */}
                <div className="mb-4 p-4 bg-black/30 rounded-xl border border-lime-400/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-lime-400">Observações e Valor</h4>
                    {editingQuote === quote.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateQuoteDetails(quote.id)}
                          className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingQuote(null)}
                          className="text-xs px-3 py-1 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingQuote(quote.id)}
                        className="text-xs text-lime-400 hover:text-lime-300 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                    )}
                  </div>

                  {editingQuote === quote.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Valor do Serviço</label>
                        <input
                          type="text"
                          value={quoteDetails[quote.id]?.value || ''}
                          onChange={(e) => setQuoteDetails({
                            ...quoteDetails,
                            [quote.id]: {
                              ...quoteDetails[quote.id],
                              value: e.target.value
                            }
                          })}
                          placeholder="Ex: R$ 5.000,00"
                          className="w-full px-3 py-2 bg-zinc-900 border border-lime-400/20 rounded-lg text-sm focus:border-lime-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Observações</label>
                        <textarea
                          value={quoteDetails[quote.id]?.observations || ''}
                          onChange={(e) => setQuoteDetails({
                            ...quoteDetails,
                            [quote.id]: {
                              ...quoteDetails[quote.id],
                              observations: e.target.value
                            }
                          })}
                          placeholder="Adicione observações sobre o orçamento..."
                          rows={3}
                          className="w-full px-3 py-2 bg-zinc-900 border border-lime-400/20 rounded-lg text-sm focus:border-lime-400 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {quote.value ? (
                        <div>
                          <span className="text-xs text-gray-400">Valor: </span>
                          <span className="text-sm font-semibold text-lime-400">{quote.value}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Valor não informado</p>
                      )}
                      {quote.observations ? (
                        <div>
                          <span className="text-xs text-gray-400">Observações: </span>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">{quote.observations}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Sem observações</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Controls */}
                <div className="mb-4 p-3 bg-black/30 rounded-xl">
                  <p className="text-xs text-gray-400 mb-2">Alterar Status:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange(quote.id, 'pending')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        quote.status === 'pending'
                          ? 'bg-yellow-400 text-black'
                          : 'bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20'
                      }`}
                    >
                      Pendente
                    </button>
                    <button
                      onClick={() => handleStatusChange(quote.id, 'in_progress')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        quote.status === 'in_progress'
                          ? 'bg-blue-400 text-black'
                          : 'bg-blue-400/10 text-blue-400 hover:bg-blue-400/20'
                      }`}
                    >
                      Em Atendimento
                    </button>
                    <button
                      onClick={() => handleStatusChange(quote.id, 'completed')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        quote.status === 'completed'
                          ? 'bg-green-400 text-black'
                          : 'bg-green-400/10 text-green-400 hover:bg-green-400/20'
                      }`}
                    >
                      Finalizado
                    </button>
                    <button
                      onClick={() => handleDeleteQuote(quote.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-lime-400/10">
                  <button
                    onClick={() => generateQuotePDF(quote)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-400 transition-colors text-sm"
                  >
                    <FilePlus size={16} />
                    Gerar PDF
                  </button>
                  <a
                    href={`mailto:${quote.email}?subject=Proposta: ${quote.service}&body=Olá ${quote.name},%0D%0A%0D%0AObrigado por solicitar um orçamento!%0D%0A%0D%0A`}
                    className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-black rounded-lg font-semibold hover:bg-lime-300 transition-colors text-sm"
                  >
                    <Mail size={16} />
                    Enviar Proposta
                  </a>
                  <a
                    href={`https://wa.me/${quote.phone.replace(/\D/g, '')}?text=Olá ${quote.name}! Recebi sua solicitação de orçamento para ${quote.service}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 transition-colors text-sm"
                  >
                    <Phone size={16} />
                    WhatsApp
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Quote Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-lime-400/30 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  <span className="text-lime-400">Criar</span> Novo Orçamento
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome *</label>
                    <input
                      type="text"
                      value={newQuote.name}
                      onChange={(e) => setNewQuote({ ...newQuote, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-lime-400/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                      placeholder="Nome do cliente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Empresa *</label>
                    <input
                      type="text"
                      value={newQuote.company}
                      onChange={(e) => setNewQuote({ ...newQuote, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-lime-400/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={newQuote.email}
                      onChange={(e) => setNewQuote({ ...newQuote, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-lime-400/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone *</label>
                    <input
                      type="tel"
                      value={newQuote.phone}
                      onChange={(e) => setNewQuote({ ...newQuote, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-lime-400/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Serviço</label>
                  <select
                    value={newQuote.service}
                    onChange={(e) => setNewQuote({ ...newQuote, service: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-lime-400/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                  >
                    <option value="Identidade Visual">Identidade Visual</option>
                    <option value="Design de Logotipo">Design de Logotipo</option>
                    <option value="Material Impresso">Material Impresso</option>
                    <option value="Design Digital">Design Digital</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Embalagens">Embalagens</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Orçamento</label>
                    <select
                      value={newQuote.budget}
                      onChange={(e) => setNewQuote({ ...newQuote, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-lime-400/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                    >
                      <option value="R$ 500 - R$ 1.000">R$ 500 - R$ 1.000</option>
                      <option value="R$ 1.000 - R$ 3.000">R$ 1.000 - R$ 3.000</option>
                      <option value="R$ 3.000 - R$ 5.000">R$ 3.000 - R$ 5.000</option>
                      <option value="R$ 5.000 - R$ 10.000">R$ 5.000 - R$ 10.000</option>
                      <option value="Acima de R$ 10.000">Acima de R$ 10.000</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Prazo</label>
                    <select
                      value={newQuote.deadline}
                      onChange={(e) => setNewQuote({ ...newQuote, deadline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-lime-400/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                    >
                      <option value="Menos de 1 semana">Menos de 1 semana</option>
                      <option value="1-2 semanas">1-2 semanas</option>
                      <option value="2-4 semanas">2-4 semanas</option>
                      <option value="1-2 meses">1-2 meses</option>
                      <option value="Mais de 2 meses">Mais de 2 meses</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição do Projeto *</label>
                  <textarea
                    value={newQuote.description}
                    onChange={(e) => setNewQuote({ ...newQuote, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-lime-400/20 focus:border-lime-400 focus:outline-none transition-colors text-white resize-none"
                    placeholder="Descreva os detalhes do projeto..."
                  />
                </div>

                {/* Seção de Valor e Observações */}
                <div className="p-4 bg-black/30 border border-lime-400/10 rounded-xl space-y-4">
                  <h4 className="text-sm font-semibold text-lime-400">💰 Valor e Observações (Opcional)</h4>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor do Serviço</label>
                    <input
                      type="text"
                      value={newQuote.value}
                      onChange={(e) => setNewQuote({ ...newQuote, value: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-lime-400/20 focus:border-lime-400 focus:outline-none transition-colors text-white"
                      placeholder="Ex: R$ 5.000,00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Observações</label>
                    <textarea
                      value={newQuote.observations}
                      onChange={(e) => setNewQuote({ ...newQuote, observations: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-lime-400/20 focus:border-lime-400 focus:outline-none transition-colors text-white resize-none"
                      placeholder="Adicione observações sobre o orçamento..."
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateQuote}
                    disabled={isSaving}
                    className="flex-1 bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Salvar Orçamento
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-xl font-semibold bg-zinc-800 hover:bg-zinc-700 transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}