import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { strategicCalendarApi, MONTH_NAMES, formatDay, eventBadges, type StrategicEvent } from '../../utils/strategicCalendar';
import { StoreCard } from './StoreCard';
import { StorePaletteCard } from './StorePaletteCard';
import { StorePaletteModal } from './StorePaletteModal';

interface Props {
  items: any[];
  userStatus: any;
  onDownload: (item: any) => void;
  isDownloadingItem: string | null;
  onBack: () => void;
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

export function StrategicCalendarFull({ items, userStatus, onDownload, isDownloadingItem, onBack, onRequestSubscription }: Props) {
  const [events, setEvents] = useState<StrategicEvent[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState<any | null>(null);

  const handlePaletteClick = (item: any) => {
    const isSubscriber = userStatus?.subscriptionStatus === 'active';
    if (isSubscriber) setPaletteOpen(item);
    else if (onRequestSubscription) onRequestSubscription();
  };

  const handleGuardedDownload = (it: any) => {
    const isSubscriber = userStatus?.subscriptionStatus === 'active';
    if (!isSubscriber) {
      if (onRequestSubscription) onRequestSubscription();
      return;
    }
    onDownload(it);
  };

  useEffect(() => {
    const sortIt = (arr: StrategicEvent[]) => (arr || []).slice().sort((a, b) => a.date.localeCompare(b.date));
    setEvents(sortIt(strategicCalendarApi.list()));
    strategicCalendarApi.refresh()
      .then(all => setEvents(sortIt(all)))
      .catch(err => console.error('[StrategicCalendarFull] refresh error:', err));
  }, []);

  const eventsByMonth = useMemo(() => {
    const map: Record<number, StrategicEvent[]> = {};
    for (let i = 0; i < 12; i++) map[i] = [];
    for (const e of events) {
      const m = new Date(e.date + 'T00:00:00').getMonth();
      map[m].push(e);
    }
    return map;
  }, [events]);

  const monthEvents = eventsByMonth[selectedMonth] || [];
  const selectedEvent = monthEvents.find(e => e.id === selectedEventId) || monthEvents[0] || null;
  const linkedItems = selectedEvent ? items.filter(i => selectedEvent.productIds.includes(i.id)) : [];

  return (
    <div className="bg-black min-h-screen text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800">
            <ArrowLeft size={18} />
          </button>
          <CalendarDays className="text-lime-400" size={26} />
          <h1 className="text-2xl md:text-3xl font-bold">Calendário <span className="text-lime-400">Estratégico</span> — Completo</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[600px]">
          <aside className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 px-3 py-2">Meses</h3>
            <ul className="flex flex-col">
              {MONTH_NAMES.map((name, i) => (
                <li key={name}>
                  <button
                    onClick={() => { setSelectedMonth(i); setSelectedEventId(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                      selectedMonth === i ? 'bg-lime-400 text-black' : 'text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <span>{name}</span>
                    <span className={`text-xs ${selectedMonth === i ? 'text-black/70' : 'text-zinc-500'}`}>
                      {eventsByMonth[i].length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="md:col-span-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 px-2 py-2">Eventos de {MONTH_NAMES[selectedMonth]}</h3>
            {monthEvents.length === 0 ? (
              <p className="text-zinc-500 text-sm p-4">Nenhum evento neste mês.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {monthEvents.map(ev => {
                  const { day, month } = formatDay(ev.date);
                  const isActive = (selectedEvent?.id === ev.id);
                  return (
                    <li key={ev.id}>
                      <button
                        onClick={() => setSelectedEventId(ev.id)}
                        className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                          isActive ? 'border-lime-400/60 bg-lime-400/5' : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
                          <span className="text-base font-bold leading-none">{day}</span>
                          <span className="text-[10px] font-semibold text-lime-400 mt-0.5">{month}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{ev.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {eventBadges(ev).slice(0, 2).map((b, i) => (
                              <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TONE_CLASSES[b.tone]}`}>{b.label}</span>
                            ))}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="md:col-span-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 max-h-[80vh] overflow-y-auto">
            {selectedEvent ? (
              <>
                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-zinc-800">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-lime-400/10 border border-lime-400/30 shrink-0">
                    <span className="text-xl font-bold leading-none">{formatDay(selectedEvent.date).day}</span>
                    <span className="text-[10px] font-semibold text-lime-400 mt-0.5">{formatDay(selectedEvent.date).month}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedEvent.name}</h2>
                    {selectedEvent.description && <p className="text-zinc-400 text-sm mt-1">{selectedEvent.description}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {eventBadges(selectedEvent).map((b, i) => (
                        <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TONE_CLASSES[b.tone]}`}>{b.label}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {linkedItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {linkedItems.map(item => (
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
                          onDownload={handleGuardedDownload}
                          userStatus={userStatus}
                          isDownloading={isDownloadingItem === item.id}
                          forcePremium
                        />
                      )
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm text-center py-12">Nenhuma arte vinculada a esta data.</p>
                )}
              </>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-12">Selecione um evento.</p>
            )}
          </section>
        </div>
      </div>
      <StorePaletteModal isOpen={!!paletteOpen} onClose={() => setPaletteOpen(null)} palette={paletteOpen} />
    </div>
  );
}
