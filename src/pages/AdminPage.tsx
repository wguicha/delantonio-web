import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../services/orderService';
import { menuService } from '../services/menuService';
import { API_BASE_URL } from '../services/api';
import { Logo } from '../components/layout/Logo';
import type { Order, OrderStatus, Category, MenuItem, Customer } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'Preparando',
  READY: 'Listo',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'text-yellow-400 border-yellow-700 bg-yellow-900/20',
  PREPARING: 'text-orange-400 border-orange-700 bg-orange-900/20',
  READY: 'text-green-400 border-green-700 bg-green-900/20',
  COMPLETED: 'text-rock-metal border-rock-border bg-rock-dark',
  CANCELLED: 'text-rock-red border-rock-red/40 bg-rock-red/10',
};

const STATUS_BORDER: Record<OrderStatus, string> = {
  PENDING: 'border-yellow-800/50',
  PREPARING: 'border-orange-800/50',
  READY: 'border-green-800/50',
  COMPLETED: 'border-rock-border',
  CANCELLED: 'border-rock-border',
};

type OrderFilter = 'active' | OrderStatus;
type AdminTab = 'orders' | 'menu' | 'customers';

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + '€';
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

// ── AdminPage ──────────────────────────────────────────────────────────────

export function AdminPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // ── Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('active');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [secsSinceRefresh, setSecsSinceRefresh] = useState(0);
  const [sseConnected, setSseConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Menu state
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState('pizzas');
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    price: string;
    priceHalf: string;
    priceFull: string;
  } | null>(null);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  // ── Customers state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // ── Fetch orders ────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setOrdersLoading(true);
    try {
      const result = await orderService.getOrders(1, 100);
      setOrders(result.data);
      setSecsSinceRefresh(0);
    } catch {
      // keep existing orders on silent refresh failure
    } finally {
      if (!silent) setOrdersLoading(false);
    }
  }, []);

  // SSE connection for real-time orders, with polling fallback
  useEffect(() => {
    if (activeTab !== 'orders') {
      esRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }

    const token = useAuthStore.getState().token;
    const sseUrl = `${API_BASE_URL}/orders/events?token=${encodeURIComponent(token ?? '')}`;

    setOrdersLoading(true);
    setSseConnected(false);

    const es = new EventSource(sseUrl);
    esRef.current = es;

    es.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as
        | { type: 'initial'; orders: Order[] }
        | { type: 'update'; order: Order };

      if (data.type === 'initial') {
        setOrders(data.orders);
        setOrdersLoading(false);
        setSecsSinceRefresh(0);
        setSseConnected(true);
      } else if (data.type === 'update') {
        setOrders((prev) => {
          const idx = prev.findIndex((o) => o.id === data.order.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = data.order;
            return updated;
          }
          return [data.order, ...prev];
        });
        setSecsSinceRefresh(0);
      }
    };

    es.onerror = () => {
      es.close();
      setSseConnected(false);
      // Fallback: poll every 30s
      fetchOrders();
      pollRef.current = setInterval(() => fetchOrders(true), 30000);
    };

    tickRef.current = setInterval(() => setSecsSinceRefresh((s) => s + 1), 1000);

    return () => {
      es.close();
      if (pollRef.current) clearInterval(pollRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [activeTab, fetchOrders]);

  // ── Fetch menu (once) — uses admin endpoint that returns ALL items including inactive
  useEffect(() => {
    if (activeTab !== 'menu' || categories.length > 0) return;
    setMenuLoading(true);
    menuService
      .getAdminCategories()
      .then(setCategories)
      .finally(() => setMenuLoading(false));
  }, [activeTab, categories.length]);

  // ── Fetch customers (once)
  useEffect(() => {
    if (activeTab !== 'customers' || customers.length > 0) return;
    setCustomersLoading(true);
    orderService
      .getCustomers()
      .then((res) => setCustomers(res.data))
      .finally(() => setCustomersLoading(false));
  }, [activeTab, customers.length]);

  // ── Update order status
  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await orderService.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ── Toggle menu item active
  const toggleItem = async (itemId: string) => {
    setTogglingItemId(itemId);
    try {
      const updated = await menuService.toggleItem(itemId);
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((item) =>
            item.id === itemId ? { ...item, isActive: updated.isActive } : item
          ),
        }))
      );
    } finally {
      setTogglingItemId(null);
    }
  };

  // ── Save item price edit
  const saveItemPrice = async () => {
    if (!editingItem) return;
    setSavingItemId(editingItem.id);
    try {
      const toNum = (s: string) => {
        const n = parseFloat(s.replace(',', '.'));
        return isNaN(n) ? undefined : n;
      };
      const data: Partial<Pick<MenuItem, 'price' | 'priceHalf' | 'priceFull'>> = {};
      const p = toNum(editingItem.price);
      const ph = toNum(editingItem.priceHalf);
      const pf = toNum(editingItem.priceFull);
      if (p !== undefined) data.price = p;
      if (ph !== undefined) data.priceHalf = ph;
      if (pf !== undefined) data.priceFull = pf;

      const updated = await menuService.updateItem(editingItem.id, data);
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((item) =>
            item.id === editingItem.id ? { ...item, ...updated } : item
          ),
        }))
      );
      setEditingItem(null);
    } finally {
      setSavingItemId(null);
    }
  };

  // ── Derived data
  const filteredOrders = orders.filter((o) =>
    orderFilter === 'active'
      ? ['PENDING', 'PREPARING', 'READY'].includes(o.status)
      : o.status === orderFilter
  );

  const counts = {
    active: orders.filter((o) => ['PENDING', 'PREPARING', 'READY'].includes(o.status)).length,
    PENDING: orders.filter((o) => o.status === 'PENDING').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    READY: orders.filter((o) => o.status === 'READY').length,
  };

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug) ?? categories[0];

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-rock-black">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-rock-card border-b border-rock-border px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 shrink-0">
          <Logo size="sm" />
          <span className="text-rock-metal text-xs hidden sm:block">Admin</span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1" aria-label="Secciones del panel">
          {(
            [
              { id: 'orders' as const, label: 'Pedidos', badge: counts.active },
              { id: 'menu' as const, label: 'Menú', badge: undefined },
              { id: 'customers' as const, label: 'Clientes', badge: undefined },
            ] as const
          ).map(({ id, label, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                activeTab === id
                  ? 'text-rock-white border-b-2 border-rock-red'
                  : 'text-rock-metal hover:text-rock-white'
              }`}
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
            >
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="bg-rock-red text-white text-xs w-4 h-4 flex items-center justify-center rounded-full leading-none">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="text-rock-metal hover:text-rock-red text-xs transition-colors shrink-0"
        >
          Salir
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── ORDERS TAB ───────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div>
            {/* Filters + refresh indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { key: 'active' as const, label: 'Activos', count: counts.active },
                    { key: 'PENDING' as const, label: 'Pendientes', count: counts.PENDING },
                    { key: 'PREPARING' as const, label: 'Preparando', count: counts.PREPARING },
                    { key: 'READY' as const, label: 'Listos', count: counts.READY },
                  ] as const
                ).map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setOrderFilter(key)}
                    className={`flex items-center gap-2 px-3 py-1.5 border text-sm transition-all ${
                      orderFilter === key
                        ? 'bg-rock-red border-rock-red text-white'
                        : 'border-rock-border text-rock-metal-light hover:border-rock-red/50 hover:text-rock-white'
                    }`}
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.06em' }}
                  >
                    {label}
                    <span
                      className={`text-xs px-1.5 py-0.5 ${
                        orderFilter === key ? 'bg-white/20' : 'bg-rock-border/40'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-rock-metal">
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    sseConnected ? 'bg-green-500 animate-pulse' : secsSinceRefresh < 5 ? 'bg-yellow-500' : 'bg-rock-border'
                  }`}
                  title={sseConnected ? 'Tiempo real (SSE)' : 'Polling (fallback)'}
                />
                <span>{sseConnected ? 'En vivo' : `Hace ${secsSinceRefresh}s`}</span>
                {!sseConnected && (
                  <button
                    onClick={() => fetchOrders()}
                    className="text-rock-red hover:text-rock-red-bright transition-colors text-base leading-none"
                    aria-label="Actualizar pedidos"
                  >
                    ↻
                  </button>
                )}
              </div>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-rock-border border-t-rock-red rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 text-rock-metal">
                <p className="text-4xl mb-3" aria-hidden="true">🎸</p>
                <p>
                  No hay pedidos{' '}
                  {orderFilter === 'active'
                    ? 'activos'
                    : STATUS_LABELS[orderFilter as OrderStatus]?.toLowerCase()}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    updating={updatingOrderId === order.id}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MENU TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'menu' && (
          <div>
            <h1
              className="text-rock-white mb-6"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: '2rem',
                letterSpacing: '0.1em',
              }}
            >
              GESTIÓN DEL <span style={{ color: '#dc2626' }}>MENÚ</span>
            </h1>

            {menuLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-rock-border border-t-rock-red rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Category tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => { setActiveCategorySlug(cat.slug); setEditingItem(null); }}
                      className={`px-3 py-1.5 border text-sm transition-all ${
                        activeCategorySlug === cat.slug
                          ? 'bg-rock-red border-rock-red text-white'
                          : 'border-rock-border text-rock-metal-light hover:border-rock-red/50 hover:text-rock-white'
                      }`}
                      style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.06em' }}
                    >
                      {cat.name}
                      <span className="ml-1.5 text-xs opacity-60">({cat.items.length})</span>
                    </button>
                  ))}
                </div>

                {activeCategory && (
                  <div className="bg-rock-card border border-rock-border overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-rock-border flex items-center justify-between">
                      <span className="text-rock-metal text-xs">
                        {activeCategory.items.filter((i) => i.isActive).length}/
                        {activeCategory.items.length} activos
                      </span>
                      <span className="text-rock-metal text-xs opacity-60">
                        Clic en el precio para editar
                      </span>
                    </div>
                    <ul className="divide-y divide-rock-border">
                      {activeCategory.items.map((item) => (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          toggling={togglingItemId === item.id}
                          editing={editingItem?.id === item.id ? editingItem : null}
                          saving={savingItemId === item.id}
                          onToggle={() => toggleItem(item.id)}
                          onStartEdit={() =>
                            setEditingItem({
                              id: item.id,
                              price: item.price != null ? String(item.price) : '',
                              priceHalf: item.priceHalf != null ? String(item.priceHalf) : '',
                              priceFull: item.priceFull != null ? String(item.priceFull) : '',
                            })
                          }
                          onEditChange={(field, val) =>
                            setEditingItem((prev) => prev && { ...prev, [field]: val })
                          }
                          onSave={saveItemPrice}
                          onCancel={() => setEditingItem(null)}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── CUSTOMERS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'customers' && (
          <div>
            <h1
              className="text-rock-white mb-6"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: '2rem',
                letterSpacing: '0.1em',
              }}
            >
              CLIENTES
              {customers.length > 0 && (
                <span className="text-rock-metal ml-3 text-xl">{customers.length}</span>
              )}
            </h1>

            {customersLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-rock-border border-t-rock-red rounded-full animate-spin" />
              </div>
            ) : customers.length === 0 ? (
              <p className="text-rock-metal text-center py-20">No hay clientes registrados</p>
            ) : (
              <div className="bg-rock-card border border-rock-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-rock-border text-left">
                        {['Nombre', 'Teléfono', 'Primer pedido', 'Último pedido', 'Pedidos'].map(
                          (h, i) => (
                            <th
                              key={h}
                              className={`px-4 py-3 text-rock-metal text-xs uppercase tracking-wider font-normal ${
                                i === 4 ? 'text-right' : ''
                              } ${i === 2 ? 'hidden md:table-cell' : ''}`}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rock-border">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-rock-dark/50 transition-colors">
                          <td className="px-4 py-3 text-rock-white">{customer.name}</td>
                          <td className="px-4 py-3 text-rock-metal-light font-mono text-xs">
                            {customer.phone}
                          </td>
                          <td className="px-4 py-3 text-rock-metal hidden md:table-cell">
                            {formatDate(customer.firstOrderDate)}
                          </td>
                          <td className="px-4 py-3 text-rock-metal">
                            {formatDate(customer.lastOrderDate)}
                          </td>
                          <td
                            className="px-4 py-3 text-rock-gold text-right"
                            style={{
                              fontFamily: "'Bebas Neue', Impact, sans-serif",
                              fontSize: '1rem',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {customer.orders?.length ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── OrderCard ──────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  updating: boolean;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string; cls: string }>> = {
  PENDING: { status: 'PREPARING', label: 'Preparando', cls: 'bg-orange-700 hover:bg-orange-600 text-white' },
  PREPARING: { status: 'READY', label: 'Listo', cls: 'bg-green-700 hover:bg-green-600 text-white' },
  READY: { status: 'COMPLETED', label: 'Completado', cls: 'bg-rock-border hover:bg-rock-metal/30 text-rock-white' },
};

function OrderCard({ order, updating, onUpdateStatus }: OrderCardProps) {
  const next = NEXT_STATUS[order.status];

  return (
    <article
      className={`bg-rock-card border ${STATUS_BORDER[order.status]} flex flex-col`}
      aria-label={`Pedido de ${order.customer.name}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-rock-border gap-2">
        <div className="min-w-0">
          <p className="text-rock-white text-sm font-medium truncate">{order.customer.name}</p>
          <p className="text-rock-metal text-xs font-mono">{order.customer.phone}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 border shrink-0 ${STATUS_COLORS[order.status]}`}
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Items */}
      <ul className="px-4 py-3 space-y-1 border-b border-rock-border flex-1">
        {order.items.map((oi) => (
          <li key={oi.id} className="flex justify-between gap-2 text-xs">
            <span className="text-rock-metal-light min-w-0 truncate">
              <span className="text-rock-white mr-1">{oi.quantity}×</span>
              {oi.menuItem.name}
              {oi.size && (
                <span className="text-rock-metal ml-1 shrink-0">
                  ({oi.size === 'half' ? 'media' : 'entera'})
                </span>
              )}
            </span>
            {oi.unitPrice > 0 && (
              <span className="text-rock-gold shrink-0">{formatPrice(oi.unitPrice * oi.quantity)}</span>
            )}
          </li>
        ))}
        {order.notes && (
          <li className="text-rock-metal text-xs italic pt-1 mt-1 border-t border-rock-border">
            📝 {order.notes}
          </li>
        )}
      </ul>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-rock-metal text-xs">
            Recogida: <span className="text-rock-white">{formatTime(order.pickupTime)}</span>
          </p>
          <p
            className="text-rock-gold"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif', letterSpacing: '0.05em'", fontSize: '1.1rem' }}
          >
            {formatPrice(order.totalAmount)}
          </p>
        </div>
        <div className="flex gap-2">
          {next && (
            <button
              onClick={() => onUpdateStatus(order.id, next.status)}
              disabled={updating}
              className={`${next.cls} text-xs px-3 py-1.5 transition-colors disabled:opacity-50`}
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
            >
              {updating ? '...' : next.label}
            </button>
          )}
          {['PENDING', 'PREPARING'].includes(order.status) && (
            <button
              onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
              disabled={updating}
              className="border border-rock-red/50 text-rock-red hover:bg-rock-red/10 text-xs px-2 py-1.5 transition-colors disabled:opacity-50"
              aria-label="Cancelar pedido"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        <p className="text-rock-metal text-xs opacity-40">
          #{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}{' '}
          {formatTime(order.createdAt)}
        </p>
      </div>
    </article>
  );
}

// ── MenuItemRow ────────────────────────────────────────────────────────────

interface MenuItemRowProps {
  item: MenuItem;
  toggling: boolean;
  editing: { id: string; price: string; priceHalf: string; priceFull: string } | null;
  saving: boolean;
  onToggle: () => void;
  onStartEdit: () => void;
  onEditChange: (field: 'price' | 'priceHalf' | 'priceFull', val: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function MenuItemRow({
  item,
  toggling,
  editing,
  saving,
  onToggle,
  onStartEdit,
  onEditChange,
  onSave,
  onCancel,
}: MenuItemRowProps) {
  const hasHalfFull = item.priceHalf != null || item.priceFull != null;

  return (
    <li className={`px-4 py-3 transition-opacity ${!item.isActive ? 'opacity-40' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-rock-white text-sm font-medium">{item.name}</p>
          {item.description && (
            <p className="text-rock-metal text-xs mt-0.5 line-clamp-1">{item.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Price (click to edit) */}
          {!editing && (
            <button
              onClick={onStartEdit}
              className="text-rock-gold text-sm hover:opacity-70 transition-opacity text-right"
              style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
              title="Editar precio"
            >
              {hasHalfFull ? (
                <span className="text-xs space-y-0.5">
                  {item.priceHalf != null && (
                    <span className="block">M: {formatPrice(item.priceHalf)}</span>
                  )}
                  {item.priceFull != null && (
                    <span className="block">E: {formatPrice(item.priceFull)}</span>
                  )}
                </span>
              ) : item.price != null ? (
                formatPrice(item.price)
              ) : (
                <span className="text-rock-metal text-xs">—</span>
              )}
            </button>
          )}

          {/* Toggle switch */}
          <button
            onClick={onToggle}
            disabled={toggling}
            className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-50 shrink-0 ${
              item.isActive ? 'bg-rock-red' : 'bg-rock-border'
            }`}
            aria-label={item.isActive ? `Desactivar ${item.name}` : `Activar ${item.name}`}
            aria-pressed={item.isActive}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                item.isActive ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Inline price editor */}
      {editing && (
        <div className="mt-3 p-3 bg-rock-dark border border-rock-border flex flex-wrap gap-3 items-end">
          {!hasHalfFull && (
            <div>
              <label className="block text-rock-metal text-xs mb-1">Precio (€)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={editing.price}
                onChange={(e) => onEditChange('price', e.target.value)}
                className="w-24 bg-rock-black border border-rock-border text-rock-white px-2 py-1 text-sm focus:outline-none focus:border-rock-red"
                autoFocus
              />
            </div>
          )}
          {hasHalfFull && (
            <>
              <div>
                <label className="block text-rock-metal text-xs mb-1">Media (€)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editing.priceHalf}
                  onChange={(e) => onEditChange('priceHalf', e.target.value)}
                  className="w-24 bg-rock-black border border-rock-border text-rock-white px-2 py-1 text-sm focus:outline-none focus:border-rock-red"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-rock-metal text-xs mb-1">Entera (€)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editing.priceFull}
                  onChange={(e) => onEditChange('priceFull', e.target.value)}
                  className="w-24 bg-rock-black border border-rock-border text-rock-white px-2 py-1 text-sm focus:outline-none focus:border-rock-red"
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="bg-rock-red hover:bg-rock-red-bright text-white text-xs px-3 py-1.5 transition-colors disabled:opacity-50"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
            >
              {saving ? '...' : 'GUARDAR'}
            </button>
            <button
              onClick={onCancel}
              className="border border-rock-border text-rock-metal hover:text-rock-white text-xs px-3 py-1.5 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
