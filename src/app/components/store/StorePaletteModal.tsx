import { X, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface StorePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: any;
}

export function StorePaletteModal({ isOpen, onClose, palette }: StorePaletteModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen || !palette) return null;

  const colors = palette.colors || [];

  const cleanGradient = (val: string) => {
    if (!val) return '';
    // Trim first, then remove semicolon, then remove property prefix (background or background-image)
    let clean = val.trim();
    clean = clean.replace(/;$/, '');
    clean = clean.replace(/^(background(-image)?:\s*)/i, '');
    return clean;
  };

  const formatColor = (c: string) => {
     if (!c) return 'transparent';
     let color = c.trim();
     if (!color.startsWith('#') && /^[0-9A-Fa-f]{3,6}$/.test(color)) {
        return '#' + color;
     }
     return color;
  };

  const handleCopy = (text: string, index: number) => {
    // If copying gradient CSS, ensure it's a full valid rule or just the value?
    // User probably wants the full "background: linear-gradient(...);" or just the value.
    // The prompt implies "copiem os códigos hexadecimais ou CSS".
    // Let's copy exactly what's stored, or maybe the clean version + "background: ...;"?
    // Let's assume copying the value is safer, or maybe full rule.
    // Given the error was about render, copying the raw stored value is fine, but maybe let's copy the cleaned version wrapped in background?
    
    // Actually, let's just copy what was passed, assuming it might be cleaned now.
    // But for the render below, use cleanGradient.
    
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success(`Copiado: ${text}`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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
           className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        >
           <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10"><X size={20} /></button>
           
           <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                 {palette.title}
                 <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                    {palette.gradient ? 'Degradê' : 'Paleta'}
                 </span>
              </h2>
              
              {palette.gradient ? (
                 <div className="space-y-6">
                    <div className="w-full h-[200px] rounded-xl shadow-lg border border-zinc-800" style={{ background: cleanGradient(palette.gradient) }} />
                    
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex items-center justify-between gap-4">
                        <code className="flex-1 text-sm text-zinc-300 font-mono break-all line-clamp-2">
                           {palette.gradient}
                        </code>
                        <button 
                           onClick={() => handleCopy(palette.gradient, 999)}
                           className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shrink-0"
                        >
                           {copiedIndex === 999 ? <Check size={16} className="text-lime-400" /> : <Copy size={16} />}
                           Copiar CSS
                        </button>
                    </div>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[400px] md:h-[300px]">
                    {colors.map((color: string, index: number) => (
                       <div key={index} className="flex flex-col h-full group">
                          <div 
                             className="flex-1 rounded-xl mb-3 shadow-lg relative group-hover:scale-[1.02] transition-transform"
                             style={{ backgroundColor: formatColor(color) }}
                          >
                             {/* Hover Overlay */}
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                          </div>
                          
                          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                             <span className="font-mono text-sm text-zinc-300 uppercase">{color}</span>
                             <button 
                                onClick={() => handleCopy(color, index)}
                                className="text-zinc-500 hover:text-white transition-colors"
                                title="Copiar cor"
                             >
                                {copiedIndex === index ? <Check size={16} className="text-lime-400" /> : <Copy size={16} />}
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
