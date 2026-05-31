import { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LogOut, ArrowLeft, RefreshCw, Plus, Instagram, Youtube, Video, Facebook, Twitter } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

import { CalendarDay } from './CalendarDay';
import { PostModal, CalendarPostData } from './PostModal';
import { PostPreview } from './PostPreview';
import { SocialIntegrationModal, SocialAccount } from './SocialIntegrationModal';
import logoImage from '../../imports/logo_ediliano_designer_branco_e_verde.png';

interface AdminCalendarProps {
  onLogout: () => void;
  onBack: () => void;
}

export function AdminCalendar({ onLogout, onBack }: AdminCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<CalendarPostData[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CalendarPostData | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Hover Preview State
  const [hoveredPost, setHoveredPost] = useState<CalendarPostData | null>(null);
  const [hoverPos, setHoverPos] = useState<{ top: number, left: number } | null>(null);

  // Generate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Fetch posts and accounts
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${publicAnonKey}` };
      
      // Trigger schedule check (lazy cron)
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/cron/check-schedule`, { 
        method: 'POST',
        headers 
      }).catch(err => console.error("Schedule check failed:", err));

      const [postsRes, accountsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/calendar-posts`, { headers }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/social-accounts`, { headers })
      ]);

      const postsData = await postsRes.json();
      const accountsData = await accountsRes.json();

      if (postsData.success) setPosts(postsData.posts);
      if (accountsData.success) setAccounts(accountsData.accounts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleAddPost = (date: Date) => {
    setSelectedPost(undefined);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleEditPost = (post: CalendarPostData) => {
    setSelectedPost(post);
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  const handleSavePost = async (post: CalendarPostData) => {
    const isEdit = !!post.id;
    const url = isEdit 
      ? `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/calendar-posts/${post.id}`
      : `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/calendar-posts`;
    
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(post),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/calendar-posts/${postId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const handleMovePost = async (postId: string, newDate: Date) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/calendar-posts/${postId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ date: newDate.toISOString() }),
        }
      );
      await fetchData();
    } catch (error) {
      console.error('Error moving post:', error);
    }
  };

  const handleHoverPost = (post: CalendarPostData | null, rect?: DOMRect) => {
    if (!post || !rect) {
      setHoveredPost(null);
      setHoverPos(null);
      return;
    }

    let left = rect.right + 10;
    let top = rect.top;

    // Adjust position to stay on screen
    if (left + 320 > window.innerWidth) {
      left = rect.left - 330;
    }
    if (top + 450 > window.innerHeight) {
      top = window.innerHeight - 460;
    }
    // Ensure top is not negative
    if (top < 10) top = 10;

    setHoveredPost(post);
    setHoverPos({ top, left });
  };

  const handleConnectAccount = async (platform: string, username: string, token: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/social-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ platform, username, token, connected: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao conectar conta');
      }

      await fetchData();
    } catch (error) {
      console.error('Error connecting account:', error);
      throw error; // Re-throw to be caught by the modal
    }
  };

  const handleDisconnectAccount = async (platform: string) => {
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6/social-accounts/${platform}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      await fetchData();
    } catch (error) {
      console.error('Error disconnecting account:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-20 shadow-xl">
        <div className="container mx-auto max-w-7xl flex flex-col gap-4">
          
          {/* Top Row: Navigation & Title */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Voltar ao Painel"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime-400/10 rounded-lg flex items-center justify-center">
                  <CalendarIcon size={20} className="text-lime-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Calendário de Conteúdo</h1>
                  <p className="text-xs text-gray-400">Gerenciamento Mensal</p>
                </div>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-4 bg-black/50 p-1 rounded-xl border border-zinc-800">
              <button onClick={handlePrevMonth} className="p-2 hover:text-lime-400 transition-colors">
                <ChevronLeft size={20} />
              </button>
              
              <div className="text-center min-w-[150px]">
                <span className="font-bold text-lg capitalize">
                  {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                </span>
              </div>

              <button onClick={handleNextMonth} className="p-2 hover:text-lime-400 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleToday}
                className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
              >
                Hoje
              </button>
              <button 
                onClick={() => fetchData()}
                className={`p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white transition-colors ${isLoading ? 'animate-spin' : ''}`}
                title="Atualizar"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          {/* Bottom Row: Social Accounts */}
          <div className="flex items-center gap-4 pt-4 border-t border-zinc-800 overflow-x-auto pb-2 custom-scrollbar">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Conexões:</span>
            
            <button
              onClick={() => setIsSocialModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                accounts.find(a => a.platform === 'instagram') 
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' 
                  : 'bg-zinc-900 border-zinc-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              <Instagram size={14} />
              Instagram
              {accounts.find(a => a.platform === 'instagram') && <div className="w-1.5 h-1.5 rounded-full bg-pink-500 ml-1" />}
            </button>

            <button
              onClick={() => setIsSocialModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                accounts.find(a => a.platform === 'facebook') 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                  : 'bg-zinc-900 border-zinc-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              <Facebook size={14} />
              Facebook
              {accounts.find(a => a.platform === 'facebook') && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1" />}
            </button>

            <button
              onClick={() => setIsSocialModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                accounts.find(a => a.platform === 'twitter') 
                  ? 'bg-white/10 border-white/30 text-white' 
                  : 'bg-zinc-900 border-zinc-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              <Twitter size={14} />
              X (Twitter)
              {accounts.find(a => a.platform === 'twitter') && <div className="w-1.5 h-1.5 rounded-full bg-white ml-1" />}
            </button>

            <button
              onClick={() => setIsSocialModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                accounts.find(a => a.platform === 'youtube') 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-zinc-900 border-zinc-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              <Youtube size={14} />
              YouTube
              {accounts.find(a => a.platform === 'youtube') && <div className="w-1.5 h-1.5 rounded-full bg-red-500 ml-1" />}
            </button>

            <button
              onClick={() => setIsSocialModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                accounts.find(a => a.platform === 'tiktok') 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                  : 'bg-zinc-900 border-zinc-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              <Video size={14} />
              TikTok
              {accounts.find(a => a.platform === 'tiktok') && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 ml-1" />}
            </button>

            <button
              onClick={() => setIsSocialModalOpen(true)}
              className="ml-auto text-xs text-lime-400 hover:underline whitespace-nowrap"
            >
              Gerenciar Conexões
            </button>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="flex-1 overflow-hidden flex flex-col p-4 bg-black">
        <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col max-w-7xl mx-auto w-full shadow-2xl">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900">
            {weekDays.map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-gray-400 border-r border-zinc-800 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-6">
            {calendarDays.map((day, index) => {
              const dayPosts = posts.filter(post => 
                isSameDay(new Date(post.date), day)
              );

              return (
                <CalendarDay
                  key={day.toISOString()}
                  day={day}
                  currentMonth={currentDate}
                  posts={dayPosts}
                  onAddPost={handleAddPost}
                  onEditPost={handleEditPost}
                  onMovePost={handleMovePost}
                  onHoverPost={handleHoverPost}
                />
              );
            })}
          </div>
        </div>
      </main>
      
      {/* Footer Logo */}
      <div className="py-4 text-center">
        <img src={logoImage} alt="Ediliano Designer" className="h-6 opacity-30 hover:opacity-100 transition-opacity mx-auto" />
      </div>

      {/* Hover Preview Overlay */}
      {hoveredPost && hoverPos && (
        <div 
          className="fixed z-50 pointer-events-none drop-shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            top: hoverPos.top, 
            left: hoverPos.left,
            width: '320px'
          }}
        >
          <div className="bg-black/95 p-3 rounded-xl border border-zinc-700 backdrop-blur-md shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Preview
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                hoveredPost.status === 'published' ? 'bg-green-500/20 text-green-400' : 
                hoveredPost.status === 'error' ? 'bg-red-500/20 text-red-400' : 
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {hoveredPost.status}
              </span>
            </div>
            <PostPreview post={hoveredPost} />
          </div>
        </div>
      )}

      {/* Modals */}
      <PostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
        initialData={selectedPost}
        selectedDate={selectedDate}
      />

      <SocialIntegrationModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        accounts={accounts}
        onConnect={handleConnectAccount}
        onDisconnect={handleDisconnectAccount}
      />
    </div>
  );
}