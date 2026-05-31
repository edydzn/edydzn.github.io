import { Download, Lock, Star, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface StoreItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  isFree: boolean;
  isFeatured: boolean;
}

interface StoreCardProps {
  item: StoreItem;
  onDownload: (item: StoreItem) => void;
  userStatus: any;
  isDownloading: boolean;
  forcePremium?: boolean;
}

export function StoreCard({ item, onDownload, userStatus, isDownloading, forcePremium }: StoreCardProps) {
  // Free items: just need to be logged in (unless forcePremium overrides — used in calendar context)
  // Premium items: need active subscription OR to purchase individually
  const treatAsFree = item.isFree && !forcePremium;
  const isLocked = !treatAsFree && (!userStatus || userStatus.subscriptionStatus !== 'active');
  const downloadsLeft = userStatus?.downloadsToday !== undefined ? 5 - userStatus.downloadsToday : 0;
  const canDownload = treatAsFree || (!isLocked && downloadsLeft > 0);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-lime-500/50 transition-colors group relative flex flex-col h-full"
    >
      {/* Badge */}
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        {treatAsFree ? (
           <span className="bg-lime-400 text-black text-[10px] font-bold px-2 py-1 rounded">GRÁTIS</span>
        ) : (
           <span className="bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded border border-zinc-700">PREMIUM</span>
        )}
        {item.isFeatured && (
           <span className="bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
             <Star size={10} fill="black" /> DESTAQUE
           </span>
        )}
      </div>

      {/* Image */}
      <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
         <ImageWithFallback 
           src={item.image} 
           alt={item.title} 
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
         />
         {isLocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
               <Lock className="text-white/50" size={32} />
            </div>
         )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
         <div className="text-[10px] text-lime-400 uppercase tracking-wider font-bold mb-1">{item.category}</div>
         <h3 className="font-bold text-white mb-2 line-clamp-1">{item.title}</h3>
         <p className="text-zinc-400 text-xs mb-4 line-clamp-2 flex-1">{item.description || ''}</p>
         
         <button
            onClick={() => onDownload(item)}
            disabled={isDownloading}
            className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
               treatAsFree || canDownload
               ? 'bg-white text-black hover:bg-lime-400' 
               : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 cursor-pointer'
            }`}
         >
            {isDownloading ? (
               <span className="animate-pulse">Baixando...</span>
            ) : treatAsFree ? (
               <>
                 <Download size={14} /> Download Grátis
               </>
            ) : isLocked ? (
               <>
                 <Lock size={14} /> Assinar ou Comprar
               </>
            ) : (
               <>
                 <Download size={14} /> Download
               </>
            )}
         </button>
      </div>
    </motion.div>
  );
}
