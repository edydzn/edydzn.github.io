import { useState, useEffect } from 'react';
import { StoreHero } from './StoreHero';
import { StoreGrid } from './StoreGrid';
import { StrategicCalendar } from './StrategicCalendar';
import { StrategicCalendarFull } from './StrategicCalendarFull';
import { StoreAuthModal } from './StoreAuthModal';
import { StoreSubscription } from './StoreSubscription';
import { StoreUserAccount } from './StoreUserAccount';
import { storeApi } from '../../utils/storeApi';
import { supabase } from '../../utils/supabase/client';
import { Loader2, LogOut, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function StorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  // Track if we should open sub modal after login
  const [pendingSubscribe, setPendingSubscribe] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  useEffect(() => {
    // Check Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserStatus();
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserStatus();
      else setUserStatus(null);
    });

    // Check query param for payment success
    if (window.location.search.includes('success=true') || window.location.pathname === '/pagamento-efetivado') {
       toast.success("Pagamento confirmado! Aproveite sua assinatura.");
    }

    fetchItems();

    return () => authSub.unsubscribe();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await storeApi.getItems();
      console.log('[StorePage] API response:', data);
      if (data.success) {
        setItems(data.items || []);
      } else {
        console.error('[StorePage] Failed to load items:', data.error);
      }
    } catch (e) {
      console.error('[StorePage] fetchItems exception:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatus = async () => {
    try {
      const data = await storeApi.getUserStatus();
      if (data?.success) setUserStatus(data.status);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async (item: any) => {
    // For free items, just require login
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    // For premium items without access, offer subscription
    if (!item.isFree && (!userStatus || userStatus.subscriptionStatus !== 'active')) {
      setShowSubModal(true);
      return;
    }

    // Proceed with download
    setDownloadingId(item.id);
    try {
      const res = await storeApi.download(item.id);
      
      if (res.success) {
        toast.success("Download iniciado!");
        window.open(res.url, '_blank');
        setUserStatus((prev: any) => ({
          ...prev,
          downloadsToday: res.downloadsToday
        }));
      } else {
        if (res.error === 'subscription_required') {
           setShowSubModal(true);
        } else if (res.error === 'limit_reached') {
           toast.error("Limite diário atingido! Volte amanhã.");
        } else {
           toast.error("Erro no download. Tente novamente.");
        }
      }
    } catch (e) {
      toast.error("Erro de conexão.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Called when user wants to subscribe
  const handleRequestSubscription = () => {
    if (!session) {
      // User not logged in — show auth modal first, then open sub modal after login
      setPendingSubscribe(true);
      setShowAuthModal(true);
      return;
    }
    setShowSubModal(true);
  };

  // The actual payment flow (called from StoreSubscription modal)
  const handleSubscribe = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[StorePage] Starting Mercado Pago checkout...');
      const res = await storeApi.subscribeMercadoPago();
      console.log('[StorePage] Mercado Pago response:', res);

      if (res.success && res.url) {
        toast.success("Redirecionando para o Mercado Pago...");
        // Redirect to Mercado Pago checkout
        setTimeout(() => {
          window.location.href = res.url;
        }, 500);
        return { success: true };
      } else {
        const errorMsg = res.error || "Erro ao iniciar pagamento.";
        console.error("[StorePage] Payment Error:", res);
        return { success: false, error: errorMsg };
      }
    } catch (e: any) {
      console.error("[StorePage] Subscribe exception:", e);
      const msg = e.message || "Tente novamente.";
      return { success: false, error: msg };
    }
  };

  const handleAuthSuccess = () => {
    fetchUserStatus();
    toast.success("Login realizado com sucesso!");
    
    // If user was trying to subscribe before login, open the subscription modal now
    if (pendingSubscribe) {
      setPendingSubscribe(false);
      setTimeout(() => setShowSubModal(true), 300);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu da conta.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
         <Loader2 className="animate-spin text-lime-400" size={32} />
      </div>
    );
  }

  if (showFullCalendar) {
    return (
      <StrategicCalendarFull
        items={items}
        userStatus={userStatus}
        onDownload={handleDownload}
        isDownloadingItem={downloadingId}
        onBack={() => setShowFullCalendar(false)}
        onRequestSubscription={handleRequestSubscription}
      />
    );
  }

  return (
    <div className="bg-black min-h-screen text-white pt-24 pb-20">
      <div className="container mx-auto px-4">

        {/* Store Header / User Bar */}
        <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
           <div>
              <h1 className="text-3xl font-bold mb-2">Creator <span className="text-lime-400">Digital</span></h1>
              <p className="text-zinc-400 text-sm">Recursos premium para designers exigentes.</p>
           </div>
           
           <div className="flex items-center gap-4">
              {session ? (
                 <div className="flex items-center gap-4">
                    <button onClick={() => setShowAccount(true)} className="text-right hidden md:block hover:bg-zinc-900 rounded-lg px-2 py-1 transition-colors">
                       <div className="text-xs text-zinc-400">Minha conta</div>
                       <div className="font-bold text-sm truncate max-w-[150px]">{userStatus?.email || session.user.email}</div>
                    </button>
                    <button onClick={() => setShowAccount(true)} className="md:hidden p-2 bg-zinc-900 rounded-lg" title="Minha conta">
                       <UserIcon size={16} className="text-lime-400" />
                    </button>
                    
                    {userStatus?.subscriptionStatus === 'active' ? (
                       <div className="bg-zinc-900 border border-lime-500/30 px-3 py-1.5 rounded-lg flex flex-col items-center">
                          <span className="text-[10px] text-lime-400 font-bold uppercase tracking-wider">Downloads Hoje</span>
                          <span className="font-mono font-bold text-white">{userStatus.downloadsToday}/5</span>
                       </div>
                    ) : (
                       <button 
                         onClick={handleRequestSubscription}
                         className="bg-lime-400 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-lime-300 transition-colors"
                       >
                         Assinar Premium
                       </button>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                      title="Sair"
                    >
                       <LogOut size={18} />
                    </button>
                 </div>
              ) : (
                 <button 
                   onClick={() => setShowAuthModal(true)}
                   className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-lime-400/50 px-4 py-2 rounded-lg transition-all"
                 >
                    <UserIcon size={16} className="text-lime-400" />
                    <span className="text-sm font-bold">Entrar / Cadastrar</span>
                 </button>
              )}
           </div>
        </div>

        <StoreHero items={items} onDownload={handleDownload} />

        <StoreGrid
          items={items}
          onDownload={handleDownload}
          userStatus={userStatus}
          isDownloadingItem={downloadingId}
          onRequestSubscription={handleRequestSubscription}
          beforeGrid={
            <StrategicCalendar
              items={items}
              userStatus={userStatus}
              onDownload={handleDownload}
              isDownloadingItem={downloadingId}
              onOpenFull={() => setShowFullCalendar(true)}
              onRequestSubscription={handleRequestSubscription}
            />
          }
        />
      </div>

      <StoreAuthModal 
        isOpen={showAuthModal} 
        onClose={() => { setShowAuthModal(false); setPendingSubscribe(false); }}
        onAuthSuccess={handleAuthSuccess}
      />

      <StoreUserAccount
        isOpen={showAccount}
        onClose={() => setShowAccount(false)}
        userStatus={userStatus}
        session={session}
        onUpdated={fetchUserStatus}
      />

      <StoreSubscription
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}
