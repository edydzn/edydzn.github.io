import { motion } from 'motion/react';
import { Users, RefreshCw, AlertCircle, LogOut, Mail, MessageCircle, Download, ArrowLeft, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logoImage from '../../imports/logo_ediliano_designer_branco_e_verde.png';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source?: string;
  timestamp: number;
  createdAt: string;
}

interface LeadsAdminProps {
  onLogout?: () => void;
  onBack?: () => void;
}

export function LeadsAdmin({ onLogout, onBack }: LeadsAdminProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/leads`,
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
        setLeads(data.leads || []);
      } else {
        setError(data.error || 'Erro ao carregar leads');
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
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

  const toggleLeadSelection = (leadId: string) => {
    const newSelection = new Set(selectedLeads);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedLeads(newSelection);
  };

  const selectAllLeads = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/leads/${leadId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        setLeads(leads.filter(l => l.id !== leadId));
        selectedLeads.delete(leadId);
        setSelectedLeads(new Set(selectedLeads));
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao excluir lead');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError('Erro ao conectar com o servidor');
    }
  };

  const exportToVCF = () => {
    const selectedLeadsList = leads.filter(lead => selectedLeads.has(lead.id));
    
    if (selectedLeadsList.length === 0) {
      alert('Selecione pelo menos um lead para exportar');
      return;
    }

    let vcfContent = '';
    
    selectedLeadsList.forEach(lead => {
      vcfContent += 'BEGIN:VCARD\n';
      vcfContent += 'VERSION:3.0\n';
      vcfContent += `FN:${lead.name}\n`;
      vcfContent += `TEL;TYPE=CELL:${lead.phone}\n`;
      vcfContent += `EMAIL:${lead.email}\n`;
      vcfContent += `NOTE:Lead capturado em ${formatDate(lead.timestamp)}\n`;
      vcfContent += 'END:VCARD\n\n';
    });

    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.vcf`);
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
                <span className="text-lime-400">Leads</span> Capturados
              </h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {selectedLeads.size > 0 && (
                <button
                  onClick={exportToVCF}
                  className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-400 transition-all text-sm"
                >
                  <Download size={16} />
                  Exportar VCF ({selectedLeads.size})
                </button>
              )}
              <button
                onClick={fetchLeads}
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
          <div className="flex items-center gap-4">
            <p className="text-gray-400 text-lg">
              Total de leads: <span className="text-lime-400 font-bold">{leads.length}</span>
            </p>
            {leads.length > 0 && (
              <button
                onClick={selectAllLeads}
                className="text-sm text-lime-400 hover:text-lime-300 transition-colors"
              >
                {selectedLeads.size === leads.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            )}
          </div>
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
            <p className="text-gray-400">Carregando leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-zinc-900 rounded-2xl border border-lime-400/20"
          >
            <Users size={60} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum lead capturado ainda</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`bg-zinc-900 border rounded-2xl p-6 hover:border-lime-400/50 transition-all ${
                  selectedLeads.has(lead.id) ? 'border-lime-400' : 'border-lime-400/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedLeads.has(lead.id)}
                    onChange={() => toggleLeadSelection(lead.id)}
                    className="mt-1 w-5 h-5 rounded border-lime-400/30 bg-zinc-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-0 cursor-pointer"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-xl">{lead.name}</h3>
                          {lead.source === 'orçamento' && (
                            <span className="px-2 py-1 bg-lime-400/20 text-lime-400 text-xs font-bold rounded">
                              ORÇAMENTO
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <a href={`mailto:${lead.email}`} className="text-sm text-gray-400 hover:text-lime-400 transition-colors">
                            📧 {lead.email}
                          </a>
                          <a href={`tel:${lead.phone}`} className="text-sm text-gray-400 hover:text-lime-400 transition-colors">
                            📱 {lead.phone}
                          </a>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(lead.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-lime-400/10">
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-2 text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors"
                      >
                        <Mail size={14} />
                        Enviar E-mail
                      </a>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Olá ${encodeURIComponent(lead.name)}! Tudo bem?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition-colors"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="flex items-center gap-2 text-sm bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors ml-auto"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  </div>
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