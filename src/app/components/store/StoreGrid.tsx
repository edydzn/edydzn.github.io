import { useState } from 'react';
import { StoreCard } from './StoreCard';
import { StorePaletteCard } from './StorePaletteCard';
import { StorePaletteModal } from './StorePaletteModal';
import { Search, ChevronDown } from 'lucide-react';

interface StoreItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  isFree: boolean;
  isFeatured: boolean;
  colors?: string[];
  gradient?: string;
}

interface StoreGridProps {
  items: StoreItem[];
  onDownload: (item: StoreItem) => void;
  userStatus: any;
  isDownloadingItem: string | null;
  onRequestSubscription?: () => void;
  beforeGrid?: React.ReactNode;
}

const CATEGORIES = [
  "Todos",
  "PSD",
  "Affinity",
  "Canva",
  "Figma",
  "Corel",
  "Camisas",
  "Fotos",
  "Texturas",
  "Vetores",
  "Apresentações",
  "Mockups",
  "Selos 3D",
  "Paletas",
  "Outros"
];

export function StoreGrid({ items, onDownload, userStatus, isDownloadingItem, onRequestSubscription, beforeGrid }: StoreGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPalette, setSelectedPalette] = useState<StoreItem | null>(null);

  const filteredItems = items.filter(item => {
    const itemCategory = item.category ? item.category.trim() : "";
    const matchesCategory = selectedCategory === "Todos" || itemCategory.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePaletteClick = (item: StoreItem) => {
     const isSubscriber = userStatus?.subscriptionStatus === 'active';
     if (isSubscriber) {
        setSelectedPalette(item);
     } else {
        // If has callback, request subscription, otherwise maybe alert or nothing
        if (onRequestSubscription) onRequestSubscription();
     }
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 z-30 bg-black/95 backdrop-blur py-4 border-b border-zinc-800/50">
        
        {/* Categories (fit without scrollbar; overflow → "Mais" select) */}
        {(() => {
          const VISIBLE_COUNT = 7;
          const visible = CATEGORIES.slice(0, VISIBLE_COUNT);
          const overflow = CATEGORIES.slice(VISIBLE_COUNT);
          const overflowSelected = overflow.includes(selectedCategory);
          return (
            <div className="w-full md:flex-1 flex flex-wrap items-center gap-2">
              {visible.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-lime-400 text-black'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {overflow.length > 0 && (
                <div className="relative">
                  <select
                    value={overflowSelected ? selectedCategory : ''}
                    onChange={(e) => e.target.value && setSelectedCategory(e.target.value)}
                    className={`appearance-none whitespace-nowrap pl-4 pr-9 py-2 rounded-full text-sm font-medium transition-all cursor-pointer outline-none ${
                      overflowSelected
                        ? 'bg-lime-400 text-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <option value="" disabled>Mais</option>
                    {overflow.map(cat => (
                      <option key={cat} value={cat} className="bg-zinc-900 text-white">{cat}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                      overflowSelected ? 'text-black' : 'text-zinc-400'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })()}

        {/* Search */}
        <div className="relative w-full md:w-64 shrink-0">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
           <input 
             type="text" 
             placeholder="Buscar artes..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:border-lime-400 outline-none"
           />
        </div>
      </div>

      {/* Grid */}
      {beforeGrid}

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            (item.category && item.category.trim().toLowerCase() === 'paletas') ? (
              <StorePaletteCard 
                key={item.id}
                item={item}
                userStatus={userStatus}
                onClick={handlePaletteClick}
              />
            ) : (
              <StoreCard 
                key={item.id} 
                item={item} 
                onDownload={onDownload} 
                userStatus={userStatus}
                isDownloading={isDownloadingItem === item.id}
              />
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500">
           <p className="text-lg">Nenhum item encontrado.</p>
           <button onClick={() => {setSelectedCategory("Todos"); setSearchQuery("");}} className="text-lime-400 text-sm mt-2 hover:underline">
              Limpar filtros
           </button>
        </div>
      )}

      {/* Palette Modal */}
      <StorePaletteModal 
         isOpen={!!selectedPalette} 
         onClose={() => setSelectedPalette(null)} 
         palette={selectedPalette} 
      />
    </div>
  );
}