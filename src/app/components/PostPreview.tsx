import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Share2, Repeat, ThumbsUp, MessageSquare } from 'lucide-react';
import { CalendarPostData } from './PostModal';

interface PostPreviewProps {
  post: Partial<CalendarPostData>;
  className?: string;
}

export function PostPreview({ post, className = '' }: PostPreviewProps) {
  const platform = post.platform || 'instagram';
  const isVideo = post.type === 'video' || post.type === 'reels' || post.type === 'shorts' || post.type === 'tiktok';
  const hasMedia = post.media && post.media.length > 0;
  const firstMedia = hasMedia ? post.media![0] : null;

  // Mock user data
  const user = {
    name: 'Ediliano Designer',
    username: '@edilianodesigner',
    avatar: 'https://github.com/shadcn.png' // Placeholder avatar
  };

  const renderInstagram = () => (
    <div className="bg-black text-white rounded-xl overflow-hidden border border-zinc-800 font-sans text-sm">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
               <span className="text-xs font-bold">ED</span>
            </div>
          </div>
          <span className="font-semibold text-xs">{user.username}</span>
        </div>
        <MoreHorizontal size={16} />
      </div>

      {/* Media */}
      <div className="bg-zinc-900 aspect-square flex items-center justify-center overflow-hidden relative">
        {hasMedia ? (
          isVideo ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
               <span className="text-xs">VIDEO PREVIEW</span>
            </div>
          ) : (
            <img src={firstMedia?.url} alt="Post" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="text-zinc-600 text-xs">Sem mídia</div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Heart size={20} />
            <MessageCircle size={20} />
            <Send size={20} />
          </div>
          <Bookmark size={20} />
        </div>
        <div className="text-xs font-semibold mb-1">1.234 curtidas</div>
        <div className="text-xs">
          <span className="font-semibold mr-2">{user.username}</span>
          <span className="text-zinc-300">{post.content || 'Sua legenda aparecerá aqui...'}</span>
        </div>
      </div>
    </div>
  );

  const renderFacebook = () => (
    <div className="bg-[#242526] text-white rounded-xl overflow-hidden border border-zinc-700 font-sans text-sm">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center">
             <span className="font-bold">ED</span>
          </div>
          <div>
            <div className="font-semibold text-sm">{user.name}</div>
            <div className="text-xs text-gray-400">2 h &middot; 🌎</div>
          </div>
        </div>
        <MoreHorizontal size={16} />
      </div>

      {/* Content Text */}
      <div className="px-3 pb-3 text-sm">
        {post.content || 'Sua legenda aparecerá aqui...'}
      </div>

      {/* Media */}
      {hasMedia && (
        <div className="bg-black aspect-video flex items-center justify-center overflow-hidden">
           <img src={firstMedia?.url} alt="Post" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-zinc-700 mt-1">
        <div className="flex items-center justify-between text-gray-400 px-4">
          <div className="flex items-center gap-2"><ThumbsUp size={18} /> Curtir</div>
          <div className="flex items-center gap-2"><MessageSquare size={18} /> Comentar</div>
          <div className="flex items-center gap-2"><Share2 size={18} /> Compartilhar</div>
        </div>
      </div>
    </div>
  );

  const renderTwitter = () => (
    <div className="bg-black text-white rounded-xl overflow-hidden border border-zinc-800 font-sans text-sm p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
             <span className="font-bold">ED</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-bold text-sm">{user.name}</span>
            <span className="text-gray-500 text-sm">{user.username} &middot; 2h</span>
          </div>
          
          <div className="text-sm mb-3 whitespace-pre-wrap">
            {post.content || 'Seu tweet aparecerá aqui...'}
          </div>

          {hasMedia && (
            <div className="rounded-xl overflow-hidden border border-zinc-800 mb-3 aspect-video bg-zinc-900">
               <img src={firstMedia?.url} alt="Tweet media" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between text-gray-500 max-w-xs">
            <MessageCircle size={16} />
            <Repeat size={16} />
            <Heart size={16} />
            <Share2 size={16} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTikTok = () => (
    <div className="bg-black text-white rounded-xl overflow-hidden border border-zinc-800 font-sans h-[400px] relative flex items-center justify-center">
       {/* Background Media */}
       <div className="absolute inset-0 bg-zinc-900">
          {hasMedia ? (
             <img src={firstMedia?.url} alt="Background" className="w-full h-full object-cover opacity-80" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-zinc-600">No Video</div>
          )}
       </div>

       {/* Overlay Controls */}
       <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="font-bold mb-1">@{user.username.replace('@','')}</div>
          <div className="text-xs opacity-90 mb-4 line-clamp-2">{post.content || 'Descrição do vídeo...'}</div>
          <div className="flex items-center gap-2 text-xs">
             <div className="w-4 h-4 rounded-full bg-gray-600"></div>
             Original Sound - {user.name}
          </div>
       </div>

       {/* Right Sidebar */}
       <div className="absolute right-2 bottom-12 flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-700 border border-white flex items-center justify-center">ED</div>
          <div className="flex flex-col items-center gap-1">
             <Heart size={24} fill="white" />
             <span className="text-xs font-bold">12K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
             <MessageCircle size={24} fill="white" />
             <span className="text-xs font-bold">450</span>
          </div>
          <Share2 size={24} />
       </div>
    </div>
  );

  return (
    <div className={`${className} transition-all duration-300`}>
      {platform === 'instagram' && renderInstagram()}
      {platform === 'facebook' && renderFacebook()}
      {(platform === 'twitter' || platform === 'x' as any) && renderTwitter()}
      {(platform === 'tiktok' || platform === 'reels' as any || platform === 'shorts' as any) && renderTikTok()}
      {platform === 'youtube' && renderFacebook()} {/* Fallback simple view */}
    </div>
  );
}