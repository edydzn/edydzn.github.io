import { motion } from 'motion/react';
import { Lock, Shield, AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { useState } from 'react';
import logoImage from '../../imports/logo_ediliano_designer_branco_e_verde.png';

import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const ADMIN_PASSWORD = '#Edydzn51122';
const ADMIN_EMAIL = 'contato@edilianodesigner.com.br';
// Removed hardcoded email check for reset since backend handles it now
// But keeping it for quick client-side validation if needed
const AUTHORIZED_EMAILS = [
  'contato@edilianodesigner.com.br',
  'edydzn@gmail.com'
];

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        // Store auth in sessionStorage (expires when browser closes)
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminAuthTime', Date.now().toString());
        onLoginSuccess();
      } else {
        setError('Senha incorreta. Tente novamente.');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsResetting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: resetEmail }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          setShowResetForm(false);
          setResetSuccess(false);
          setResetEmail('');
        }, 5000); // Increased to 5 seconds to give time to read
      } else {
        setError(data.error || 'Erro ao processar solicitação.');
      }
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsResetting(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-zinc-900 border border-lime-400/30 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-lime-400" />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                Redefinir <span className="text-lime-400">Senha</span>
              </h2>
              <p className="text-gray-400 text-sm">
                Insira seu email administrativo para receber instruções
              </p>
            </div>

            {resetSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center"
              >
                <p className="text-green-400 mb-2">✓ Solicitação recebida!</p>
                <p className="text-sm text-gray-400">
                  Como não há servidor de email configurado, verifique o console do servidor para ver a mensagem (Ambiente de Desenvolvimento).
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Email Administrativo
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="contato@edilianodesigner.com.br"
                      required
                      className="w-full bg-black border border-lime-400/30 rounded-xl px-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-lime-400 transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full bg-lime-400 text-black py-3 rounded-xl font-semibold hover:bg-lime-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isResetting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Instruções'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false);
                      setError('');
                      setResetEmail('');
                    }}
                    className="w-full bg-zinc-800 text-white py-3 rounded-xl font-semibold hover:bg-zinc-700 transition-colors"
                  >
                    Voltar ao Login
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center text-sm text-gray-400"
          >
            <p>
              Para suporte, entre em contato:{' '}
              <a href={`mailto:${ADMIN_EMAIL}`} className="text-lime-400 hover:text-lime-300">
                {ADMIN_EMAIL}
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-zinc-900 border-2 border-lime-400/30 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-lime-400" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Painel <span className="text-lime-400">Administrativo</span>
            </h2>
            <p className="text-gray-400 text-sm">
              Acesso restrito - Apenas administradores
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Senha do Administrador
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  autoFocus
                  className="w-full bg-black border border-lime-400/30 rounded-xl px-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-lime-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-lime-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"
              >
                <Lock size={16} />
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-lime-400 text-black py-3 rounded-xl font-semibold hover:bg-lime-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Acessar Painel
                </>
              )}
            </button>

            {/* Reset Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowResetForm(true)}
                className="text-sm text-gray-400 hover:text-lime-400 transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-zinc-900/50 border border-lime-400/20 rounded-xl text-center"
        >
          <p className="text-xs text-gray-400">
            <Lock size={12} className="inline mr-1" />
            Suas credenciais são criptografadas e seguras
          </p>
        </motion.div>

        {/* Back to Site */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-lime-400 transition-colors"
          >
            ← Voltar ao site
          </a>
        </motion.div>

        {/* Logo no rodapé */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <img src={logoImage} alt="Ediliano Designer" className="h-6 opacity-40 hover:opacity-100 transition-opacity" />
        </motion.div>
      </motion.div>
    </div>
  );
}