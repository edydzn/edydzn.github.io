import { format, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Plus } from 'lucide-react';
import { CalendarPostData } from './PostModal';
import { CalendarPost } from './CalendarPost';

interface CalendarDayProps {
  day: Date;
  currentMonth: Date;
  posts: CalendarPostData[];
  onAddPost: (date: Date) => void;
  onEditPost: (post: CalendarPostData) => void;
  onMovePost: (postId: string, newDate: Date) => void;
  onHoverPost: (post: CalendarPostData | null, rect?: DOMRect) => void;
}

export function CalendarDay({ day, currentMonth, posts, onAddPost, onEditPost, onMovePost, onHoverPost }: CalendarDayProps) {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isTodayDate = isToday(day);

  // Drag and drop disabled
  const isOver = false;

  return (
    <div
      className={`
        min-h-[120px] p-2 border-b border-r border-zinc-800 relative group flex flex-col
        transition-colors
        ${!isCurrentMonth ? 'bg-zinc-950/50' : 'bg-black'}
        ${isOver ? 'bg-lime-400/5' : ''}
      `}
    >
      {/* Date Header */}
      <div className="flex items-center justify-between mb-2">
        <span 
          className={`
            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
            ${isTodayDate ? 'bg-lime-400 text-black' : isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}
          `}
        >
          {format(day, 'd')}
        </span>
        
        {/* Add Button (Visible on Hover) */}
        <button
          onClick={() => onAddPost(day)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded-md text-gray-400 hover:text-lime-400 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Posts Container */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar max-h-[150px]">
        {posts.map(post => (
          <CalendarPost 
            key={post.id} 
            post={post} 
            onClick={onEditPost}
            onHover={onHoverPost}
          />
        ))}
      </div>
    </div>
  );
}