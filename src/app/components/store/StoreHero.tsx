import Slider from "react-slick";
import { useEffect } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Star, ArrowRight } from "lucide-react";

interface StoreItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  isFree: boolean;
  isFeatured: boolean;
  gradient?: string;
  colors?: string[];
}

interface StoreHeroProps {
  items: StoreItem[];
  onDownload: (item: StoreItem) => void;
}

export function StoreHero({ items, onDownload }: StoreHeroProps) {
  // Inject Slick CSS via CDN to avoid build errors with fonts/gifs
  useEffect(() => {
    const link1 = document.createElement("link");
    link1.rel = "stylesheet";
    link1.href = "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href = "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css";
    document.head.appendChild(link2);

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
    };
  }, []);

  const cleanGradient = (val: string) => {
    if (!val) return '';
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

  // Filter only featured items
  const featuredItems = items.filter(i => i.isFeatured);

  if (featuredItems.length === 0) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    appendDots: (dots: any) => (
      <div style={{ bottom: "20px" }}>
        <ul className="m-0 p-0 flex justify-center gap-2"> {dots} </ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-2 h-2 rounded-full bg-white/20 hover:bg-lime-400 transition-colors cursor-pointer" />
    )
  };

  return (
    <div className="w-full mb-12 relative group">
      <Slider {...settings}>
        {featuredItems.map(item => {
          const isPalette = item.category && item.category.trim().toLowerCase() === 'paletas';
          const hasImage = !!item.image;

          return (
            <div key={item.id} className="outline-none px-2">
              <div className="relative aspect-[21/9] md:aspect-[21/7] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                 {isPalette ? (
                   /* Palette hero background */
                   item.gradient ? (
                     <div className="absolute inset-0" style={{ background: cleanGradient(item.gradient) }} />
                   ) : (
                     <div className="absolute inset-0 flex">
                       {(item.colors || ['#333']).filter((c: string) => c).slice(0, 5).map((c: string, i: number) => (
                         <div key={i} className="flex-1 h-full" style={{ backgroundColor: formatColor(c) }} />
                       ))}
                     </div>
                   )
                 ) : hasImage ? (
                   <ImageWithFallback 
                     src={item.image} 
                     alt={item.title} 
                     className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"
                   />
                 ) : (
                   <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6 md:p-12">
                    <div className="max-w-2xl">
                       <div className="flex items-center gap-2 mb-3">
                          <span className="bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                             <Star size={12} fill="black" /> DESTAQUE
                          </span>
                          <span className="text-lime-400 font-bold text-sm tracking-wider uppercase">{item.category}</span>
                       </div>
                       <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">{item.title}</h2>
                       <p className="text-zinc-300 text-sm md:text-base mb-6 line-clamp-2 max-w-lg">{item.description}</p>
                       
                       <button 
                         onClick={() => onDownload(item)}
                         className="bg-white text-black hover:bg-lime-400 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all w-fit"
                       >
                         Ver Detalhes <ArrowRight size={16} />
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </Slider>
      
      {/* Custom Global Styles for Dots to override slick defaults if needed */}
      <style>{`
        .slick-dots li { width: auto; margin: 0; }
        .slick-dots li.slick-active div { background-color: #1AFF25; transform: scale(1.2); }
      `}</style>
    </div>
  );
}