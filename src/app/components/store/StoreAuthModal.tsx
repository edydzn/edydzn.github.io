import { useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';

interface StoreAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export function StoreAuthModal({ isOpen, onClose, onAuthSuccess }: StoreAuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } else {
        // Use server-side signup to avoid Supabase email confirmation issues
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/auth/signup`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${publicAnonKey}`
             },
             body: JSON.stringify({ email, password, name })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
           throw new Error(data.error || "Erro ao criar conta");
        }
        
        // Auto login after successful signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) throw signInError;
      }
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro na autenticação");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }} 
           animate={{ opacity: 1, scale: 1, y: 0 }} 
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        >
           <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>
           
           <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-1">
                 {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                 {isLogin ? 'Acesse sua conta para baixar arquivos.' : 'Cadastre-se para acessar o Creator.'}
              </p>

              {error && (
                 <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">
                    {error}
                 </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                 {!isLogin && (
                    <div>
                       <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input 
                             type="text" 
                             placeholder="Nome Completo"
                             value={name}
                             onChange={e => setName(e.target.value)}
                             className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-4 py-3 text-sm text-white focus:border-lime-400 outline-none"
                             required={!isLogin}
                          />
                       </div>
                    </div>
                 )}

                 <div>
                    <div className="relative">
                       <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                       <input 
                          type="email" 
                          placeholder="Email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-4 py-3 text-sm text-white focus:border-lime-400 outline-none"
                          required
                       />
                    </div>
                 </div>

                 <div>
                    <div className="relative">
                       <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                       <input 
                          type="password" 
                          placeholder="Senha"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-4 py-3 text-sm text-white focus:border-lime-400 outline-none"
                          required
                       />
                    </div>
                 </div>

                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition-colors flex items-center justify-center gap-2"
                 >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Entrar' : 'Cadastrar')}
                 </button>
              </form>

              <div className="mt-6 text-center text-xs text-zinc-500">
                 {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
                 <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-lime-400 hover:underline font-bold"
                 >
                    {isLogin ? 'Cadastre-se' : 'Faça login'}
                 </button>
              </div>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
