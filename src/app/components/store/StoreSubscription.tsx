import { X, Check, CreditCard, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface StoreSubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => Promise<{ success: boolean; error?: string }>;
}

export function StoreSubscription({ isOpen, onClose, onSubscribe }: StoreSubscriptionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
       const result = await onSubscribe();
       if (result.success) {
         // If redirect happened via window.open, keep modal open briefly
         // If not, close
         setTimeout(() => onClose(), 1500);
       } else {
         setError(result.error || "Erro ao processar pagamento. Tente novamente.");
       }
    } catch (e: any) {
       console.error("[StoreSubscription] Error:", e);
       setError(e.message || "Erro inesperado. Tente novamente.");
    } finally {
       setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }} 
           animate={{ opacity: 1, scale: 1, y: 0 }} 
           exit={{ opacity: 0, scale: 0.9, y: 20 }}
           className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        >
           <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>
           
           <div className="p-8 text-center">
              <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <ShieldCheck size={32} className="text-lime-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Plano Premium</h2>
              <p className="text-zinc-400 mb-6">Desbloqueie acesso ilimitado a todos os arquivos premium do Creator.</p>
              
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-6">
                 <div className="text-3xl font-bold text-white mb-1">R$ 35,00<span className="text-sm text-zinc-500 font-normal">/mês</span></div>
                 <div className="text-xs text-lime-400 font-medium">Cancelamento a qualquer momento</div>
              </div>

              <div className="space-y-3 mb-8 text-left">
                 <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-lime-400 shrink-0" /> <span>5 Downloads Premium por dia</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-lime-400 shrink-0" /> <span>Acesso a arquivos PSD, Vetores e 3D</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-lime-400 shrink-0" /> <span>Atualizações semanais de conteúdo</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check size={16} className="text-lime-400 shrink-0" /> <span>Uso comercial liberado</span>
                 </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-start gap-2 text-left">
                   <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                   <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-lime-400 text-black font-bold py-3 rounded-xl hover:bg-lime-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {loading ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                     </svg>
                     Processando...
                   </span>
                 ) : (
                   <><CreditCard size={18} /> Assinar Agora</>
                 )}
              </button>
              
              <p className="text-[10px] text-zinc-600 mt-4">
                 Pagamento seguro via Mercado Pago. Ao assinar você concorda com os Termos de Uso.
              </p>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
