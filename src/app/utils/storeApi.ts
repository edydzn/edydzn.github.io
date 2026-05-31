import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabase/client';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const SERVER_URL = `${SUPABASE_URL}/functions/v1/make-server-bdae3ab6`;

// Helper to get default headers (always include anon key for Supabase gateway)
const defaultHeaders = (): Record<string, string> => ({
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
});

// Helper to get auth headers (use session token if available, fallback to anon key)
const authHeaders = async (): Promise<Record<string, string>> => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
    'Content-Type': 'application/json',
  };
};

// Safe JSON parser with error handling
const safeJson = async (response: Response) => {
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch {
      errorMsg = await response.text().catch(() => errorMsg);
    }
    console.error(`[StoreAPI] Request failed: ${errorMsg}`);
    return { success: false, error: errorMsg, items: [] };
  }
  return await response.json();
};

export const storeApi = {
  // Get all items
  getItems: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/store/items?t=${Date.now()}`, {
        headers: defaultHeaders(),
      });
      return await safeJson(response);
    } catch (error) {
      console.error('[StoreAPI] getItems error:', error);
      return { success: false, error: 'Erro de conexão', items: [] };
    }
  },

  // Get user status (Sub, downloads)
  getUserStatus: async () => {
    try {
      const headers = await authHeaders();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const response = await fetch(`${SERVER_URL}/store/user-status`, { headers });
      return await safeJson(response);
    } catch (error) {
      console.error('[StoreAPI] getUserStatus error:', error);
      return null;
    }
  },

  // Subscribe (Mock) - Keeping for reference or fallback
  subscribe: async () => {
    const headers = await authHeaders();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not logged in");

    const response = await fetch(`${SERVER_URL}/store/subscribe`, {
      method: 'POST',
      headers,
    });
    return await safeJson(response);
  },

  // Subscribe via InfinitePay
  subscribeInfinitePay: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) throw new Error("Sessão inválida. Faça login novamente.");

    const response = await fetch(`${SERVER_URL}/store/subscribe/infinitepay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      if (data.code === 401 && data.message === "Invalid JWT") {
        throw new Error("Sessão expirada. Recarregue a página.");
      }
      throw new Error(data.error || "Erro no servidor");
    }

    return data;
  },

  // Subscribe via Mercado Pago
  subscribeMercadoPago: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) throw new Error("Sessão inválida. Faça login novamente.");

    const response = await fetch(`${SERVER_URL}/store/checkout/mercadopago`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'subscription' }),
    });

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (parseErr) {
      console.error('[StoreAPI] subscribeMercadoPago non-JSON response:', raw);
      throw new Error(`Resposta inválida do servidor (status ${response.status}). Detalhes no console.`);
    }
    if (!response.ok) {
      throw new Error(data.error || `Erro ao criar pagamento (status ${response.status})`);
    }
    return data;
  },

  // Purchase item via Mercado Pago
  purchaseItemMercadoPago: async (itemId: string) => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) throw new Error("Sessão inválida. Faça login novamente.");

    const response = await fetch(`${SERVER_URL}/store/checkout/mercadopago`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'item', itemId }),
    });

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (parseErr) {
      console.error('[StoreAPI] purchaseItemMercadoPago non-JSON response:', raw);
      throw new Error(`Resposta inválida do servidor (status ${response.status}). Detalhes no console.`);
    }
    if (!response.ok) {
      throw new Error(data.error || `Erro ao criar pagamento (status ${response.status})`);
    }
    return data;
  },

  // Check payment status by external reference
  checkPaymentStatus: async (externalReference: string) => {
    const response = await fetch(`${SERVER_URL}/store/checkout/mercadopago/status`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify({ externalReference }),
    });
    return await safeJson(response);
  },

  // Download
  download: async (itemId: string) => {
    const headers = await authHeaders();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not logged in");

    const response = await fetch(`${SERVER_URL}/store/download`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ itemId }),
    });
    return await safeJson(response);
  },

  // Admin: Create Item
  createItem: async (item: any) => {
    try {
      const response = await fetch(`${SERVER_URL}/store/items`, {
        method: 'POST',
        headers: defaultHeaders(),
        body: JSON.stringify(item),
      });
      return await safeJson(response);
    } catch (error) {
      console.error('[StoreAPI] createItem error:', error);
      return { success: false, error: 'Erro ao criar item' };
    }
  },

  // Admin: Update Item
  updateItem: async (id: string, item: any) => {
    try {
      const response = await fetch(`${SERVER_URL}/store/items/${id}`, {
        method: 'PUT',
        headers: defaultHeaders(),
        body: JSON.stringify(item),
      });
      return await safeJson(response);
    } catch (error) {
      console.error('[StoreAPI] updateItem error:', error);
      return { success: false, error: 'Erro ao atualizar item' };
    }
  },

  // Admin: Delete Item
  deleteItem: async (id: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/store/items/${id}`, {
        method: 'DELETE',
        headers: defaultHeaders(),
      });
      return await safeJson(response);
    } catch (error) {
      console.error('[StoreAPI] deleteItem error:', error);
      return { success: false, error: 'Erro ao excluir item' };
    }
  },

  // ===== USER PROFILE =====
  updateProfile: async (payload: { name?: string; email?: string; password?: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");
    const res = await fetch(`${SERVER_URL}/store/user/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await safeJson(res);
  },

  myDownloads: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, downloads: [] };
    const res = await fetch(`${SERVER_URL}/store/user/downloads`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    return await safeJson(res);
  },

  // ===== ADMIN =====
  adminListUsers: async () => {
    const res = await fetch(`${SERVER_URL}/admin/users`, { headers: defaultHeaders() });
    return await safeJson(res);
  },
  adminSetSubscription: async (userId: string, payload: { status: 'active' | 'inactive'; days?: number; method?: string }) => {
    const res = await fetch(`${SERVER_URL}/admin/users/${userId}/subscription`, {
      method: 'POST', headers: defaultHeaders(), body: JSON.stringify(payload),
    });
    return await safeJson(res);
  },
  adminUpdateUser: async (userId: string, payload: { name?: string; email?: string; password?: string }) => {
    const res = await fetch(`${SERVER_URL}/admin/users/${userId}`, {
      method: 'PUT', headers: defaultHeaders(), body: JSON.stringify(payload),
    });
    return await safeJson(res);
  },
  adminStats: async () => {
    const res = await fetch(`${SERVER_URL}/admin/stats`, { headers: defaultHeaders() });
    return await safeJson(res);
  },
  adminPayments: async () => {
    const res = await fetch(`${SERVER_URL}/admin/payments`, { headers: defaultHeaders() });
    return await safeJson(res);
  },
  adminRefreshPayment: async (externalRef: string) => {
    const res = await fetch(`${SERVER_URL}/admin/payments/${encodeURIComponent(externalRef)}/refresh`, {
      method: 'POST', headers: defaultHeaders(),
    });
    return await safeJson(res);
  },
};