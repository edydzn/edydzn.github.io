import { Lock, Palette } from "lucide-react";
import { motion } from "motion/react";

interface StorePaletteCardProps {
  item: any;
  userStatus: any;
  onClick: (item: any) => void;
}

export function StorePaletteCard({ item, userStatus, onClick }: StorePaletteCardProps) {
  const isSubscriber = userStatus?.subscriptionStatus === 'active';
  const colors = item.colors || ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'];
  const hasGradient = !!item.gradient;

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
     // Add hash if missing for hex codes
     if (!color.startsWith('#') && /^[0-9A-Fa-f]{3,6}$/.test(color)) {
        return '#' + color;
     }
     return color;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-lime-400/50 transition-all cursor-pointer relative"
      onClick={() => onClick(item)}
    >
      <div className="aspect-square flex flex-col">
        {hasGradient ? (
           <div className="w-full h-full" style={{ background: cleanGradient(item.gradient) }} />
        ) : (
           colors.map((color: string, index: number) => (
             <div 
               key={index} 
               className="flex-1 w-full" 
               style={{ backgroundColor: formatColor(color) }}
             />
           ))
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white truncate pr-2">{item.title}</h3>
            {/* If not subscriber, show lock icon */}
            {!isSubscriber && (
               <Lock size={14} className="text-zinc-500 shrink-0 mt-1" />
            )}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
           <Palette size={12} />
           <span>{hasGradient ? 'Degradê CSS' : 'Paleta de Cores'}</span>
        </div>
      </div>
    </motion.div>
  );
}
