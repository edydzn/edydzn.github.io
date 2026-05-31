import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Modal } from './Modal';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';

export function Footer() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  const handleAdminAccess = () => {
    window.location.href = '?admin=login';
  };

  return (
    <>
      <footer className="border-t border-lime-500/20 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Ediliano Designer. Todos os direitos reservados.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <button 
                onClick={() => setShowPrivacyPolicy(true)}
                className="hover:text-lime-400 transition-colors cursor-pointer"
              >
                Política de Privacidade
              </button>
              <button 
                onClick={() => setShowTermsOfService(true)}
                className="hover:text-lime-400 transition-colors cursor-pointer"
              >
                Termos de Uso
              </button>
              <button
                onClick={handleAdminAccess}
                className="flex items-center gap-1 hover:text-lime-400 transition-colors cursor-pointer opacity-30 hover:opacity-100"
                title="Acesso Administrativo"
              >
                <Shield size={14} />
                Admin
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        title="Política de Privacidade"
      >
        <PrivacyPolicy />
      </Modal>

      <Modal
        isOpen={showTermsOfService}
        onClose={() => setShowTermsOfService(false)}
        title="Termos de Uso"
      >
        <TermsOfService />
      </Modal>
    </>
  );
}