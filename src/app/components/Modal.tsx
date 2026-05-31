import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900 border border-lime-400/30 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-lime-400/20">
                <h2 className="text-2xl font-bold text-lime-400">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 flex items-center justify-center transition-colors group"
                  aria-label="Fechar"
                >
                  <X size={20} className="text-lime-400 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-6 flex-1">
                {children}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-lime-400/20 flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-lime-400 text-black px-6 py-2 rounded-xl font-semibold hover:bg-lime-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
