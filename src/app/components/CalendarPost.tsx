import { Instagram, Youtube, Video, Image as ImageIcon, Smartphone, Clock, Facebook, Twitter, SquarePlay } from 'lucide-react';
import { CalendarPostData } from './PostModal';
import { useRef } from 'react';

interface CalendarPostProps {
  post: CalendarPostData;
  onClick: (post: CalendarPostData) => void;
  onHover?: (post: CalendarPostData | null, rect?: DOMRect) => void;
}

export function CalendarPost({ post, onClick, onHover }: CalendarPostProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Drag and drop temporarily disabled to fix rendering issue
  const isDragging = false;

  const handleMouseEnter = () => {
    if (onHover && cardRef.current) {
      onHover(post, cardRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    if (onHover) {
      onHover(null);
    }
  };

  const getPlatformIcon = () => {
    switch (post.platform) {
      case 'instagram': return <Instagram size={12} />;
      case 'youtube': return <Youtube size={12} />;
      case 'tiktok': return <Video size={12} />;
      case 'facebook': return <Facebook size={12} />;
      case 'twitter': return <Twitter size={12} />;
      default: return <Instagram size={12} />;
    }
  };

  const getTypeIcon = () => {
    switch (post.type) {
      case 'post': return <ImageIcon size={12} />;
      case 'reels': 
      case 'shorts': return <Smartphone size={12} />;
      case 'story': return <Smartphone size={12} />;
      case 'video': return <Video size={12} />;
      case 'tiktok': return <Video size={12} />;
      default: return <ImageIcon size={12} />;
    }
  };

  const getStatusColor = () => {
    switch (post.status) {
      case 'published': return 'bg-green-500';
      case 'scheduled': return 'bg-yellow-500';
      case 'draft': return 'bg-zinc-600';
      case 'error': return 'bg-red-500';
      default: return 'bg-zinc-600';
    }
  };

  const getPlatformColor = () => {
    switch (post.platform) {
      case 'instagram': return 'text-pink-400 bg-pink-400/10';
      case 'youtube': return 'text-red-400 bg-red-400/10';
      case 'tiktok': return 'text-cyan-400 bg-cyan-400/10';
      case 'facebook': return 'text-blue-400 bg-blue-400/10';
      case 'twitter': return 'text-white bg-white/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick(post);
      }}
      className={`
        relative group cursor-pointer
        bg-zinc-900 border border-zinc-800 rounded-lg p-2
        hover:border-lime-400/50 hover:bg-zinc-800 transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        {/* Platform Badge */}
        <div className={`p-1 rounded-md ${getPlatformColor()}`}>
          {getPlatformIcon()}
        </div>
        
        {/* Status Dot */}
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} title={`Status: ${post.status}`} />
      </div>

      <h4 className="text-xs font-medium text-gray-200 line-clamp-2 mb-2 leading-tight">
        {post.content || <span className="text-zinc-600 italic">Sem título</span>}
      </h4>

      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          {getTypeIcon()}
          <span className="capitalize">{post.type}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>{post.time}</span>
        </div>
      </div>
      
      {/* Media Indicator */}
      {post.media && post.media.length > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-0.5">
          <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}