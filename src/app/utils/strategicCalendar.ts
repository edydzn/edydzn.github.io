import { projectId, publicAnonKey } from './supabase/info';

export interface StrategicEvent {
  id: string;
  name: string;
  date: string;
  tags: string[];
  productIds: string[];
  featured: boolean;
  trending?: boolean;
  description?: string;
  updatedAt?: number;
}

const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-bdae3ab6`;
const HEADERS = {
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
};

const CACHE_KEY = 'ediliano_strategic_calendar_v2_cache';
const LEGACY_KEY = 'ediliano_strategic_calendar_v1';
const MIGRATED_FLAG = 'ediliano_strategic_calendar_migrated';

const SEED: StrategicEvent[] = [
  { id: 'seed-1', name: 'Dia das Mães', date: dateOfThisYear(5, 11), tags: ['Em alta', 'Mais buscado'], productIds: [], featured: true, trending: true, description: 'Campanhas para o segundo domingo de maio.' },
  { id: 'seed-2', name: 'Dia dos Namorados', date: dateOfThisYear(6, 12), tags: ['Mais buscado'], productIds: [], featured: true, trending: true },
  { id: 'seed-3', name: 'Dia dos Pais', date: dateOfThisYear(8, 10), tags: ['Em alta'], productIds: [], featured: true, trending: false },
  { id: 'seed-4', name: 'Black Friday', date: dateOfThisYear(11, 28), tags: ['Em alta', 'Mais buscado'], productIds: [], featured: true, trending: true },
  { id: 'seed-5', name: 'Natal', date: dateOfThisYear(12, 25), tags: ['Mais buscado'], productIds: [], featured: true, trending: true },
  { id: 'seed-6', name: 'Dia do Cliente', date: dateOfThisYear(9, 15), tags: ['Em alta'], productIds: [], featured: true },
  { id: 'seed-7', name: 'Dia do Trabalhador', date: dateOfThisYear(5, 1), tags: [], productIds: [], featured: true },
  { id: 'seed-8', name: 'Dia da Independência', date: dateOfThisYear(9, 7), tags: [], productIds: [], featured: true },
];

function dateOfThisYear(month: number, day: number): string {
  const y = new Date().getFullYear();
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function readCache(): StrategicEvent[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function writeCache(events: StrategicEvent[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(events)); } catch {}
}

async function fetchServer(): Promise<StrategicEvent[] | null> {
  try {
    const res = await fetch(`${SERVER}/strategic-calendar?t=${Date.now()}`, { headers: HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.success) return null;
    return (data.events || []) as StrategicEvent[];
  } catch {
    return null;
  }
}

async function bulkUpload(events: StrategicEvent[]): Promise<boolean> {
  if (!events.length) return true;
  try {
    const res = await fetch(`${SERVER}/strategic-calendar/bulk`, {
      method: 'POST', headers: HEADERS, body: JSON.stringify({ events }),
    });
    return res.ok;
  } catch { return false; }
}

async function migrateLegacyAndSeed(serverEvents: StrategicEvent[]): Promise<StrategicEvent[]> {
  if (sessionStorage.getItem(MIGRATED_FLAG) === '1') return serverEvents;
  const toMerge: StrategicEvent[] = [];

  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacy: StrategicEvent[] = JSON.parse(legacyRaw);
      for (const e of legacy) {
        if (!serverEvents.some(s => s.id === e.id)) toMerge.push(e);
      }
    }
  } catch {}

  if (serverEvents.length === 0 && toMerge.length === 0) {
    for (const s of SEED) toMerge.push(s);
  }

  if (toMerge.length > 0) {
    const ok = await bulkUpload(toMerge);
    if (ok) {
      const fresh = await fetchServer();
      if (fresh) {
        sessionStorage.setItem(MIGRATED_FLAG, '1');
        try { localStorage.removeItem(LEGACY_KEY); } catch {}
        return fresh;
      }
    }
  }
  sessionStorage.setItem(MIGRATED_FLAG, '1');
  return serverEvents;
}

export const strategicCalendarApi = {
  list(): StrategicEvent[] {
    const c = readCache();
    if (c.length) return c;
    try {
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (legacyRaw) {
        const legacy: StrategicEvent[] = JSON.parse(legacyRaw);
        if (legacy.length) { writeCache(legacy); return legacy; }
      }
    } catch {}
    writeCache(SEED);
    return SEED;
  },

  async refresh(): Promise<StrategicEvent[]> {
    const server = await fetchServer();
    if (server === null) {
      const cache = readCache();
      return cache.length ? cache : SEED;
    }
    const merged = await migrateLegacyAndSeed(server);
    writeCache(merged);
    return merged;
  },

  async upsert(event: StrategicEvent): Promise<StrategicEvent> {
    try {
      const res = await fetch(`${SERVER}/strategic-calendar`, {
        method: 'POST', headers: HEADERS, body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const saved = data.event || event;
      const cache = readCache();
      const idx = cache.findIndex(e => e.id === saved.id);
      if (idx >= 0) cache[idx] = saved; else cache.push(saved);
      writeCache(cache);
      return saved;
    } catch (e) {
      console.error('[strategicCalendar] upsert failed, keeping local copy:', e);
      const cache = readCache();
      const idx = cache.findIndex(c => c.id === event.id);
      if (idx >= 0) cache[idx] = event; else cache.push(event);
      writeCache(cache);
      throw e;
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const res = await fetch(`${SERVER}/strategic-calendar/${encodeURIComponent(id)}`, {
        method: 'DELETE', headers: HEADERS,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeCache(readCache().filter(e => e.id !== id));
    } catch (e) {
      console.error('[strategicCalendar] remove failed:', e);
      throw e;
    }
  },

  cached(): StrategicEvent[] {
    const c = readCache();
    return c.length ? c : SEED;
  },
};

export interface EventBadge {
  label: string;
  tone: 'lime' | 'amber' | 'sky' | 'rose' | 'violet';
}

export function eventBadges(event: StrategicEvent): EventBadge[] {
  const badges: EventBadge[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event_date = new Date(event.date + 'T00:00:00');
  const diffDays = Math.round((event_date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) badges.push({ label: 'Hoje', tone: 'lime' });
  else if (diffDays === 1) badges.push({ label: 'Amanhã', tone: 'amber' });
  else if (diffDays > 1 && diffDays <= 7) badges.push({ label: 'Próximos dias', tone: 'sky' });
  else if (diffDays > 7 && event_date.getMonth() === today.getMonth() && event_date.getFullYear() === today.getFullYear()) {
    badges.push({ label: 'Este mês', tone: 'violet' });
  }

  if (event.trending) badges.push({ label: 'Em alta', tone: 'rose' });
  for (const tag of event.tags || []) badges.push({ label: tag, tone: 'violet' });
  return badges;
}

export function isStillRelevant(event: StrategicEvent): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(event.date + 'T00:00:00');
  return d.getTime() >= today.getTime();
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function formatDay(dateStr: string): { day: string; month: string } {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: MONTH_NAMES[d.getMonth()].slice(0, 3).toUpperCase(),
  };
}
