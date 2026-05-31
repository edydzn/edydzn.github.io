import { motion, AnimatePresence } from 'motion/react';
import { X, Instagram, Youtube, Video, CheckCircle, AlertCircle, Loader2, Facebook, Twitter, Key, Shield, Lock } from 'lucide-react';
import { useState } from 'react';

export interface SocialAccount {
  id: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'twitter';
  username: string;
  accessToken?: string;
  connected: boolean;
  connectedAt?: string;
}

interface SocialIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SocialAccount[];
  onConnect: (platform: string, username: string, token: string) => Promise<void>;
  onDisconnect: (platform: string) => Promise<void>;
}

export function SocialIntegrationModal({ isOpen, onClose, accounts, onConnect, onDisconnect }: SocialIntegrationModalProps) {
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic fields state
  const [field1, setField1] = useState(''); // Token / API Key
  const [field2, setField2] = useState(''); // Secret
  const [field3, setField3] = useState(''); // Access Token (Twitter/TikTok)
  const [field4, setField4] = useState(''); // Access Token Secret (Twitter)
  const [useTikTokManualToken, setUseTikTokManualToken] = useState(true);

  const platforms = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400', 
      desc: 'Requer Token do Facebook vinculado à conta Business' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500', 
      desc: 'Requer Token de Acesso da Página (Page Access Token)' },
    { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-white', 
      desc: 'Requer API Key e Access Tokens (OAuth 1.0a)' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-400', 
      desc: 'Requer Google API Key ou OAuth Token' },
    { id: 'tiktok', label: 'TikTok', icon: Video, color: 'text-cyan-400', 
      desc: 'Requer Client Key e Secret' },
  ];

  const handleConnectStart = (platformId: string) => {
    setConnectingPlatform(platformId);
    setUsernameInput('');
    setField1('');
    setField2('');
    setField3('');
    setField4('');
    setUseTikTokManualToken(true); // Default to true recommendation
    setError(null);
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingPlatform || !usernameInput) return;

    setIsLoading(true);
    setError(null);
    try {
      let finalToken = field1;

      // Se for Twitter ou TikTok, empacotar tudo num JSON
      if (connectingPlatform === 'twitter') {
        const credentials = {
          apiKey: field1,
          apiSecret: field2,
          accessToken: field3,
          accessTokenSecret: field4
        };
        finalToken = JSON.stringify(credentials);
      } else if (connectingPlatform === 'tiktok') {
        const credentials = {
          clientKey: field1,
          clientSecret: field2,
          accessToken: field3 // Campo opcional (User Access Token)
        };
        finalToken = JSON.stringify(credentials);
      }

      await onConnect(connectingPlatform, usernameInput, finalToken);
      setConnectingPlatform(null);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Erro ao conectar conta. Verifique as credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (confirm('Tem certeza que deseja desconectar esta conta?')) {
      setIsLoading(true);
      try {
        await onDisconnect(platformId);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderFormFields = (platformId: string) => {
    if (platformId === 'twitter') {
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-[10px] text-gray-400 mb-1 block">API Key (Consumer Key)</label>
                <input type="password" value={field1} onChange={e => setField1(e.target.value)} 
                  className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-white" />
             </div>
             <div>
                <label className="text-[10px] text-gray-400 mb-1 block">API Secret (Consumer Secret)</label>
                <input type="password" value={field2} onChange={e => setField2(e.target.value)} 
                  className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-white" />
             </div>
             <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Access Token</label>
                <input type="password" value={field3} onChange={e => setField3(e.target.value)} 
                  className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-white" />
             </div>
             <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Access Token Secret</label>
                <input type="password" value={field4} onChange={e => setField4(e.target.value)} 
                  className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-white" />
             </div>
          </div>
          <p className="text-[10px] text-amber-500 mt-1">
             ⚠️ Para postar tweets automaticamente, você precisa de chaves com permissão "Read and Write" no Developer Portal.
          </p>
        </>
      );
    }

    if (platformId === 'tiktok') {
      return (
        <div className="grid grid-cols-1 gap-3">
           <div className={`p-3 border rounded-lg transition-colors ${useTikTokManualToken ? 'bg-amber-500/10 border-amber-500/30' : 'bg-zinc-800/50 border-zinc-700'}`}>
             <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id="use_manual_token"
                  checked={useTikTokManualToken}
                  onChange={(e) => {
                     setUseTikTokManualToken(e.target.checked);
                     if (!e.target.checked) setField3(''); // Limpa o token se desmarcar
                  }}
                  className="rounded border-zinc-700 bg-zinc-800 text-lime-400 focus:ring-lime-400"
                /> 
                <label htmlFor="use_manual_token" className={`text-xs font-bold cursor-pointer ${useTikTokManualToken ? 'text-amber-400' : 'text-gray-400'}`}>
                   Usar Access Token (Recomendado)
                </label>
             </div>
             
             {useTikTokManualToken && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <p className="text-[10px] text-gray-400 mb-2">
                    A publicação de vídeos geralmente exige um <strong>User Access Token</strong>. O uso de Client Key/Secret gera um token de App que pode não ter permissão para postar.
                 </p>
                 <label className="text-[10px] text-gray-400 mb-1 block">Access Token (Cole aqui seu token de usuário)</label>
                 <input type="password" value={field3} onChange={e => setField3(e.target.value)} 
                    placeholder="Insira o Access Token direto (ignora Key/Secret)"
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:border-amber-400 transition-colors" />
               </motion.div>
             )}
           </div>

           <div className={`space-y-3 transition-opacity ${useTikTokManualToken ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ou use Credenciais de App</span>
                <div className="h-px bg-zinc-800 flex-1"></div>
             </div>
             <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Client Key</label>
                <input type="password" value={field1} onChange={e => setField1(e.target.value)} 
                  className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-white" />
             </div>
             <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Client Secret</label>
                <input type="password" value={field2} onChange={e => setField2(e.target.value)} 
                  className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-white" />
             </div>
           </div>
        </div>
      );
    }

    // Default for others (Single Token)
    return (
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Key size={10} className="text-gray-400" />
          <label className="text-xs text-gray-400">
            {platformId === 'facebook' || platformId === 'instagram' 
              ? 'Page Access Token (Long-lived)' 
              : 'Access Token / Chave de API'}
          </label>
        </div>
        <input
          type="password"
          value={field1}
          onChange={(e) => setField1(e.target.value)}
          placeholder={platformId === 'facebook' ? 'EAA...' : 'Token aqui'}
          className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-lime-400 outline-none font-mono"
        />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
            <h3 className="text-xl font-bold text-white">
              Conectar Redes Sociais
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
            {platforms.map(platform => {
              const account = accounts.find(a => a.platform === platform.id);
              const isConnecting = connectingPlatform === platform.id;

              return (
                <div 
                  key={platform.id}
                  className={`border border-zinc-800 rounded-xl p-4 transition-all ${
                    account ? 'bg-lime-400/5 border-lime-400/20' : 'bg-zinc-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center ${platform.color}`}>
                        <platform.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{platform.label}</h4>
                        <div className="text-[10px] text-gray-500 leading-tight mb-1">{platform.desc}</div>
                        {account ? (
                          <div className="flex items-center gap-1 text-xs text-lime-400">
                            <CheckCircle size={12} />
                            <span>Conectado como {account.username}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <AlertCircle size={12} />
                            <span>Não conectado</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isConnecting && (
                      <button
                        onClick={() => account ? handleDisconnect(platform.id) : handleConnectStart(platform.id)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          account 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                            : 'bg-white text-black hover:bg-gray-200'
                        }`}
                      >
                        {account ? 'Desconectar' : 'Configurar'}
                      </button>
                    )}
                  </div>

                  {/* Connection Form */}
                  <AnimatePresence>
                    {isConnecting && (
                      <motion.form
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                        onSubmit={handleConnectSubmit}
                      >
                        <div className="space-y-3 p-4 bg-zinc-900/80 rounded-lg border border-zinc-700 shadow-inner">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Usuário / Página</label>
                            <input
                              type="text"
                              value={usernameInput}
                              onChange={(e) => setUsernameInput(e.target.value)}
                              placeholder={platform.id === 'facebook' ? 'ID da Página (Ex: 10001234567890)' : platform.id === 'instagram' ? '@seu_instagram' : '@usuario'}
                              className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-lime-400 outline-none"
                              autoFocus
                            />
                            {platform.id === 'facebook' && (
                               <p className="text-[10px] text-gray-500 mt-1">
                                 Recomendado: Use o <strong>ID Numérico</strong> da página. Se usar o nome, certifique-se de usar um Token de Usuário para buscarmos o ID automaticamente.
                               </p>
                            )}
                            {platform.id === 'instagram' && (
                               <p className="text-[10px] text-gray-500 mt-1">
                                 <strong>Importante:</strong> Use um Token do Facebook (começa com EAA...) vinculado à conta. Tokens de "Basic Display" (IGAA...) não permitem agendamento.
                               </p>
                            )}
                          </div>
                          
                          {renderFormFields(platform.id)}

                          {error && (
                            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400">
                              {error}
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setConnectingPlatform(null)}
                              className="flex-1 bg-zinc-800 text-gray-400 px-3 py-2 rounded-lg text-sm font-semibold hover:text-white"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="flex-1 bg-lime-400 text-black px-3 py-2 rounded-lg text-sm font-semibold hover:bg-lime-300 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Credenciais'}
                            </button>
                          </div>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}