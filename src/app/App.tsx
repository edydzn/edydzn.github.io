import { useState, useEffect } from 'react';
import { Toaster } from 'sonner@2.0.3';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { SocialMedia } from './components/SocialMedia';
import { Portfolio } from './components/Portfolio';
import { Services } from './components/Services';
import { QuoteForm } from './components/QuoteForm';
import { QuotePage } from './components/QuotePage';
import { BlogWithPagination } from './components/BlogWithPagination';
import { BlogPostView } from './components/BlogPostView';
import { Contact } from './components/Contact';
import { ContactAdmin } from './components/ContactAdmin';
import { QuoteAdmin } from './components/QuoteAdmin';
import { LeadsAdmin } from './components/LeadsAdmin';
import { BlogAdmin } from './components/BlogAdmin';
import { BlogEditor } from './components/BlogEditor';
import { AdminCalendar } from './components/AdminCalendar';
import { AdminStrategicCalendar } from './components/AdminStrategicCalendar';
import { AdminSubscriptions } from './components/AdminSubscriptions';
import { AdminPortfolio } from './components/AdminPortfolio';
import { StorePage } from './components/store/StorePage';
import { StoreAdmin } from './components/store/StoreAdmin';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { FaviconHandler } from './public/favicon-handler';
import { SEO, SEOConfigs } from './components/SEO';
import { PaymentSuccess } from './components/store/PaymentSuccess';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedBlogPost, setSelectedBlogPost] = useState<string | null>(null);
  
  // Check for payment success URL
  const isPaymentSuccess = window.location.pathname === '/pagamento-efetivado';

  if (isPaymentSuccess) {
     return <PaymentSuccess />;
  }

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminView, setAdminView] = useState<'dashboard' | 'messages' | 'quotes' | 'leads' | 'blog' | 'blog-editor' | 'calendar' | 'portfolio' | 'store' | 'strategic-calendar' | 'subscriptions'>('dashboard');
  const [editingPostId, setEditingPostId] = useState<string | undefined>(undefined);

  const handleSelectPost = (postId: string) => {
    setSelectedBlogPost(postId);
  };

  const handleBackToBlog = () => {
    setSelectedBlogPost(null);
  };

  const handleRequestQuote = () => {
    setShowQuoteForm(true);
  };

  const handleBackToServices = () => {
    setShowQuoteForm(false);
  };

  // Check if URL contains admin parameter
  const urlParams = new URLSearchParams(window.location.search);
  const adminParam = urlParams.get('admin');
  const isAdminLogin = adminParam === 'login';
  const isContactAdmin = adminParam === 'messages';
  const isQuoteAdmin = adminParam === 'quotes';
  const isLeadsAdmin = adminParam === 'leads';
  const isBlogAdmin = adminParam === 'blog';
  const isBlogEditor = adminParam === 'blog-editor';
  const isCalendarAdmin = adminParam === 'calendar';
  const isPortfolioAdmin = adminParam === 'portfolio';
  const isStoreAdmin = adminParam === 'store';
  const isStrategicAdmin = adminParam === 'strategic-calendar';
  const isSubscriptionsAdmin = adminParam === 'subscriptions';
  const isAdminPanel = isAdminLogin || isContactAdmin || isQuoteAdmin || isLeadsAdmin || isBlogAdmin || isBlogEditor || isCalendarAdmin || isPortfolioAdmin || isStoreAdmin || isStrategicAdmin || isSubscriptionsAdmin;

  // Check session storage for existing auth
  const checkAuth = () => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    const adminAuthTime = sessionStorage.getItem('adminAuthTime');
    
    if (adminAuth === 'true' && adminAuthTime) {
      // Check if auth is still valid (24 hours)
      const authTime = parseInt(adminAuthTime);
      const currentTime = Date.now();
      const hoursPassed = (currentTime - authTime) / (1000 * 60 * 60);
      
      if (hoursPassed < 24) {
        return true;
      } else {
        // Auth expired
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('adminAuthTime');
        return false;
      }
    }
    return false;
  };

  // Listen for browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const adminParam = params.get('admin');
      
      if (adminParam === 'calendar') setAdminView('calendar');
      else if (adminParam === 'portfolio') setAdminView('portfolio');
      else if (adminParam === 'store') setAdminView('store');
      else if (adminParam === 'strategic-calendar') setAdminView('strategic-calendar');
      else if (adminParam === 'subscriptions') setAdminView('subscriptions');
      else if (adminParam === 'messages') setAdminView('messages');
      else if (adminParam === 'quotes') setAdminView('quotes');
      else if (adminParam === 'leads') setAdminView('leads');
      else if (adminParam === 'blog') setAdminView('blog');
      else if (adminParam === 'blog-editor') setAdminView('blog-editor');
      else if (adminParam === 'login' || !adminParam) setAdminView('dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setAdminView('dashboard');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminAuthTime');
    window.location.href = '/';
  };

  const handleSelectAdminView = (view: 'messages' | 'quotes' | 'leads' | 'blog' | 'calendar' | 'portfolio' | 'store' | 'strategic-calendar' | 'subscriptions') => {
    // Update URL to reflect the selected view
    window.history.pushState({}, '', `?admin=${view}`);
    setAdminView(view);
  };

  const handleBackToDashboard = () => {
    // Navigate back to the main admin view (effectively the dashboard if logged in)
    // We keep ?admin=login or remove params to signal "root" admin area
    window.history.pushState({}, '', '?admin=login');
    setAdminView('dashboard');
    // Force a small state update to ensure re-render if needed, though setAdminView does it
    // But let's check if the browser actually navigates
  };

  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
    setAdminView('blog-editor');
    window.history.pushState({}, '', '?admin=blog-editor');
  };

  const handleNewPost = () => {
    setEditingPostId(undefined);
    setAdminView('blog-editor');
    window.history.pushState({}, '', '?admin=blog-editor');
  };

  const handleBackToBlogAdmin = () => {
    setEditingPostId(undefined);
    setAdminView('blog');
    window.history.pushState({}, '', '?admin=blog');
  };

  // Get SEO config based on active section
  const seoConfig = SEOConfigs[activeSection as keyof typeof SEOConfigs] || SEOConfigs.home;

  // If admin panel is requested, check authentication
  if (isAdminPanel) {
    const isAuthenticated = isAdminAuthenticated || checkAuth();
    
    if (!isAuthenticated) {
      return (
        <>
          <FaviconHandler />
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        </>
      );
    }

    // Determine which admin view to show based on URL or state
    let currentAdminView = adminView;
    if (isContactAdmin) currentAdminView = 'messages';
    if (isQuoteAdmin) currentAdminView = 'quotes';
    if (isLeadsAdmin) currentAdminView = 'leads';
    if (isBlogAdmin) currentAdminView = 'blog';
    if (isBlogEditor) currentAdminView = 'blog-editor';
    if (isCalendarAdmin) currentAdminView = 'calendar';
    if (isPortfolioAdmin) currentAdminView = 'portfolio';
    if (isStoreAdmin) currentAdminView = 'store';
    if (isStrategicAdmin) currentAdminView = 'strategic-calendar';
    if (isSubscriptionsAdmin) currentAdminView = 'subscriptions';

    return (
      <>
        <FaviconHandler />
        <div className="min-h-screen bg-black text-white">
          <main>
            {currentAdminView === 'dashboard' && (
              <AdminDashboard 
                onSelectView={handleSelectAdminView}
                onLogout={handleLogout}
              />
            )}
            {currentAdminView === 'calendar' && (
              <AdminCalendar onLogout={handleLogout} onBack={handleBackToDashboard} />
            )}
            {currentAdminView === 'portfolio' && (
              <AdminPortfolio onBack={handleBackToDashboard} />
            )}
            {currentAdminView === 'store' && (
              <StoreAdmin onBack={handleBackToDashboard} />
            )}
            {currentAdminView === 'strategic-calendar' && (
              <AdminStrategicCalendar onBack={handleBackToDashboard} />
            )}
            {currentAdminView === 'subscriptions' && (
              <AdminSubscriptions onBack={handleBackToDashboard} />
            )}
            {currentAdminView === 'messages' && (
              <ContactAdmin onLogout={handleLogout} onBack={handleBackToDashboard} />
            )}
            {currentAdminView === 'quotes' && (
              <QuoteAdmin onLogout={handleLogout} onBack={handleBackToDashboard} />
            )}
            {currentAdminView === 'leads' && (
              <LeadsAdmin onLogout={handleLogout} onBack={handleBackToDashboard} />
            )}
            {currentAdminView === 'blog' && (
              <BlogAdmin 
                onLogout={handleLogout} 
                onBack={handleBackToDashboard}
                onEditPost={handleEditPost}
                onNewPost={handleNewPost}
              />
            )}
            {currentAdminView === 'blog-editor' && (
              <BlogEditor 
                postId={editingPostId}
                onBack={handleBackToBlogAdmin}
                onSave={handleBackToBlogAdmin}
              />
            )}
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <FaviconHandler />
      <SEO {...seoConfig} />
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen bg-black text-white">
        <Header activeSection={activeSection} setActiveSection={setActiveSection} />
        
        <main>
          {activeSection === 'home' && (
            <>
              <Hero setActiveSection={setActiveSection} />
              <About />
              <SocialMedia />
            </>
          )}
          {activeSection === 'store' && <StorePage />}
          {activeSection === 'quote' && <QuotePage onBack={() => setActiveSection('home')} />}
          {activeSection === 'portfolio' && <Portfolio />}
          {activeSection === 'services' && (
            showQuoteForm ? (
              <QuoteForm onBack={handleBackToServices} />
            ) : (
              <Services onRequestQuote={handleRequestQuote} />
            )
          )}
          {activeSection === 'blog' && (
            selectedBlogPost ? (
              <BlogPostView postId={selectedBlogPost} onBack={handleBackToBlog} />
            ) : (
              <BlogWithPagination onSelectPost={handleSelectPost} />
            )
          )}
          {activeSection === 'contact' && <Contact />}
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}