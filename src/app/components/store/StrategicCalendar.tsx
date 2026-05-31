import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, CalendarDays, Flame, Sparkles, ExternalLink } from 'lucide-react';
import { strategicCalendarApi, eventBadges, isStillRelevant, formatDay, type StrategicEvent } from '../../utils/strategicCalendar';
import { StoreCard } from './StoreCard';
import { StorePaletteCard } from './StorePaletteCard';
import { StorePaletteModal } from './StorePaletteModal';

interface Props {
  items: any[];
  userStatus: any;
  onDownload: (item: any) => void;
  isDownloadingItem: string | null;
  onOpenFull: () => void;
  onRequestSubscription?: () => void;
}

const isPalette = (item: any) => (item.category || '').trim().toLowerCase() === 'paletas';

const TONE_CLASSES: Record<string, string> = {
  lime: 'bg-lime-400 text-black',
  amber: 'bg-amber-400 text-black',
  sky: 'bg-sky-400 text-black',
  rose: 'bg-rose-500 text-white',
  violet: 'bg-violet-500 text-white',
};

export function StrategicCalendar({ items, userStatus, onDownload, isDownloadingItem, onOpenFull, onRequestSubscription }: Props) {
  const [events, setEvents] = useState<StrategicEvent[]>([]);
  const [selected, setSelected] = useState<StrategicEvent | null>(null);
  const [paletteOpen, setPaletteOpen] = useState<any | null>(null);

  const handlePaletteClick = (item: any) => {
    const isSubscriber = userStatus?.subscriptionStatus === 'active';
    if (isSubscriber) setPaletteOpen(item);
    else if (onRequestSubscription) onRequestSubscription();
  };
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = (arr: StrategicEvent[]) => {
      const filtered = (arr || [])
        .filter(e => e.featured && isStillRelevant(e))
        .sort((a, b) => a.date.localeCompare(b.date));
      setEvents(filtered);
    };
    apply(strategicCalendarApi.list());
    strategicCalendarApi.refresh()
      .then(apply)
      .catch(err => console.error('[StrategicCalendar] refresh error:', err));
  }, []);

  const linkedItems = useMemo(() => {
    if (!selected) return [];
    return items.filter(i => selected.productIds.includes(i.id));
  }, [selected, items]);

  const scroll = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    const amount = 320;
    trackRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (events.length === 0) return null;

  return (
    <section className="my-10">
      <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="text-lime-400" size={22} />
            <h2 className="text-2xl md:text-3xl font-bold">Calendário <span className="text-lime-400">Estratégico</span></h2>
          </div>
          <p className="text-zinc-400 text-sm">Datas importantes para suas campanhas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('left')} className="p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-lime-400/50 transition-colors" aria-label="Anterior">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll('right')} className="p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-lime-400/50 transition-colors" aria-label="Próximo">
            <ChevronRight size={18} />
          </button>
          <button onClick={onOpenFull} className="hidden md:inline-flex items-center gap-2 ml-2 px-4 py-2 rounded-full bg-lime-400 text-black text-sm font-bold hover:bg-lime-300 transition-colors">
            Ver calendário completo
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory hide-scrollbar">
        {events.map(ev => {
          const { day, month } = formatDay(ev.date);
          const badges = eventBadges(ev);
          const linkedCount = ev.productIds.length;
          return (
            <motion.button
              key={ev.id}
              onClick={() => setSelected(ev)}
              whileHover={{ y: -3 }}
              className="snap-start shrink-0 w-[260px] text-left rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-lime-400/50 transition-colors p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-lime-400/10 border border-lime-400/30">
                    <span className="text-xl font-bold leading-none text-white">{day}</span>
                    <span className="text-[10px] font-semibold text-lime-400 mt-0.5">{month}</span>
                  </div>
                </div>
                {ev.trending && <Flame size={16} className="text-rose-400" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white leading-tight line-clamp-2">{ev.name}</h3>
                {linkedCount > 0 && (
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><Sparkles size={12} /> {linkedCount} {linkedCount === 1 ? 'arte' : 'artes'} disponíveis</p>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {badges.slice(0, 3).map((b, i) => (
                  <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TONE_CLASSES[b.tone]}`}>{b.label}</span>
                ))}
              </div>
            </motion.button>
          );
        })}
        <button onClick={onOpenFull} className="md:hidden snap-start shrink-0 w-[180px] rounded-2xl border border-dashed border-lime-400/40 text-lime-400 hover:bg-lime-400/5 flex items-center justify-center text-sm font-bold">
          Ver tudo →
        </button>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-start justify-between p-5 border-b border-zinc-800 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-lime-400/10 border border-lime-400/30">
                    <span className="text-xl font-bold leading-none">{formatDay(selected.date).day}</span>
                    <span className="text-[10px] font-semibold text-lime-400 mt-0.5">{formatDay(selected.date).month}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selected.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {eventBadges(selected).map((b, i) => (
                        <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TONE_CLASSES[b.tone]}`}>{b.label}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-zinc-900 transition-colors" aria-label="Fechar">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {selected.description && <p className="text-zinc-400 text-sm mb-4">{selected.description}</p>}
                {linkedItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {linkedItems.slice(0, 6).map(item => (
                      isPalette(item) ? (
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
                          onDownload={(it) => {
                            const isSubscriber = userStatus?.subscriptionStatus === 'active';
                            if (!isSubscriber) {
                              if (onRequestSubscription) onRequestSubscription();
                              return;
                            }
                            onDownload(it);
                          }}
                          userStatus={userStatus}
                          isDownloading={isDownloadingItem === item.id}
                          forcePremium
                        />
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500">
                    <p>Nenhuma arte vinculada a esta data ainda.</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sm font-medium">Fechar</button>
                <button
                  onClick={() => { setSelected(null); onOpenFull(); }}
                  className="px-4 py-2 rounded-lg bg-lime-400 text-black hover:bg-lime-300 text-sm font-bold"
                >
                  Ver todos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StorePaletteModal isOpen={!!paletteOpen} onClose={() => setPaletteOpen(null)} palette={paletteOpen} />
    </section>
  );
}
