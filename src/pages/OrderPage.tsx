import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useMenu } from '../hooks/useMenu';
import { MenuSection } from '../components/menu/MenuSection';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { orderService } from '../services/orderService';
import { scheduleService } from '../services/scheduleService';
import type { Schedule } from '../services/scheduleService';
import type { GeoCoords } from '../services/orderService';
import type { Order } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────


function getPizzeriaStatus(schedule: Schedule): { open: boolean; message: string | null } {
  const now = new Date();
  const day = now.getDay();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const daySchedule = schedule.days.find((d) => d.day === day);

  if (!daySchedule || !daySchedule.isOpen) {
    return { open: false, message: 'Hoy estamos cerrados. Puedes hacer tu pedido para otro día.' };
  }

  const [openH, openM] = daySchedule.openTime.split(':').map(Number);
  const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const lastOrderMinutes = closeMinutes - schedule.lastOrderMinutesBefore;

  if (totalMinutes < openMinutes) {
    return { open: false, message: `Aún no hemos abierto. Abrimos a las ${daySchedule.openTime}. Puedes reservar tu pedido con antelación.` };
  }
  if (totalMinutes >= closeMinutes) {
    return { open: false, message: 'Ya hemos cerrado por hoy. Puedes hacer tu pedido para mañana.' };
  }
  if (totalMinutes >= lastOrderMinutes) {
    return { open: true, message: `⚠️ Estamos a punto de cerrar. Último pedido a las ${Math.floor(lastOrderMinutes / 60).toString().padStart(2, '0')}:${(lastOrderMinutes % 60).toString().padStart(2, '0')}.` };
  }
  return { open: true, message: null };
}

function getPickupSlots(schedule: Schedule): { label: string; value: string }[] {
  const slots: { label: string; value: string }[] = [];
  const now = new Date();
  const minTime = new Date(now.getTime() + 31 * 60 * 1000);
  const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    const daySchedule = schedule.days.find((d) => d.day === date.getDay());
    if (!daySchedule || !daySchedule.isOpen) continue;

    const [openH, openM] = daySchedule.openTime.split(':').map(Number);
    const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);
    const lastOrderMinutes = closeH * 60 + closeM - schedule.lastOrderMinutesBefore;

    for (let hour = openH; hour <= closeH; hour++) {
      for (const minute of [0, 15, 30, 45]) {
        const slotMinutes = hour * 60 + minute;
        if (slotMinutes < openH * 60 + openM) continue;
        if (slotMinutes > lastOrderMinutes) continue;

        const slot = new Date(date);
        slot.setHours(hour, minute, 0, 0);
        if (slot <= minTime) continue;

        const dayLabel = dayOffset === 0 ? 'Hoy' : DAY_NAMES[date.getDay()];
        const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push({ label: `${dayLabel} ${timeLabel}`, value: `${slot.getFullYear()}-${String(slot.getMonth() + 1).padStart(2, '0')}-${String(slot.getDate()).padStart(2, '0')}T${timeLabel}` });
      }
    }
  }
  return slots;
}

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + '€';
}

// ── Zod schema ─────────────────────────────────────────────────────────────

const orderSchema = z.object({
  phone: z
    .string()
    .min(6, 'Teléfono inválido')
    .max(12, 'Teléfono inválido')
    .refine((v) => /^\d[\d\s\-\.]{5,11}$/.test(v), 'Solo números (ej: 612 345 678)'),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  pickupTime: z
    .string()
    .min(1, 'Indica la hora de recogida')
    .refine((val) => {
      const diff = (new Date(val).getTime() - Date.now()) / 60000;
      return diff >= 30;
    }, 'Mínimo 30 minutos de antelación'),
  notes: z.string().max(500).optional(),
  acceptTerms: z
    .boolean()
    .refine((v) => v === true, 'Debes aceptar los términos'),
  acceptPrivacy: z
    .boolean()
    .refine((v) => v === true, 'Debes aceptar la política de privacidad'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

// ── Country codes ───────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: '34', label: 'ES +34' },
  { code: '351', label: 'PT +351' },
  { code: '33', label: 'FR +33' },
  { code: '49', label: 'DE +49' },
  { code: '44', label: 'GB +44' },
  { code: '39', label: 'IT +39' },
  { code: '31', label: 'NL +31' },
  { code: '32', label: 'BE +32' },
  { code: '41', label: 'CH +41' },
  { code: '1', label: 'US +1' },
];

// ── OrderPage ──────────────────────────────────────────────────────────────

export function OrderPage() {
  const { categories, loading: menuLoading } = useMenu();
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } =
    useCartStore();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [countryCode, setCountryCode] = useState('34');
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    scheduleService.getSchedule().then(setSchedule);
  }, []);

  // Geolocation
  const [geoCoords, setGeoCoords] = useState<GeoCoords | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  // Phone autocomplete
  const [lookingUpPhone, setLookingUpPhone] = useState(false);
  const phoneDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref to scroll to form on mobile
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { pickupTime: '' },
  });

  const phoneValue = watch('phone');

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      { timeout: 8000 }
    );
  }, []);

  // Phone lookup with debounce — autocomplete name
  useEffect(() => {
    if (!phoneValue || phoneValue.replace(/[\s\-.]/g, '').length < 9) return;
    if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);
    phoneDebounceRef.current = setTimeout(async () => {
      setLookingUpPhone(true);
      const result = await orderService.lookupPhone(phoneValue);
      setLookingUpPhone(false);
      if (result?.name) {
        setValue('name', result.name, { shouldValidate: true });
      }
    }, 600);
    return () => {
      if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);
    };
  }, [phoneValue, setValue]);

  const onSubmit = async (data: OrderFormValues) => {
    if (items.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await orderService.createOrder(
        {
          name: data.name,
          phone: `${countryCode}${data.phone.replace(/[\s\-\.\(\)]/g, '')}`,
          pickupTime: new Date(data.pickupTime).toISOString(),
          notes: data.notes,
          acceptTerms: data.acceptTerms,
          acceptPrivacy: data.acceptPrivacy,
        },
        items,
        geoCoords ?? undefined
      );
      clearCart();
      setCompletedOrder(order);
    } catch (err: unknown) {
      const axiosMsg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setSubmitError(axiosMsg ?? 'Error al enviar el pedido. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (completedOrder) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-28 px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6" aria-hidden="true">🤘</div>
          <h1
            className="text-rock-white mb-3 leading-none"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              letterSpacing: '0.1em',
            }}
          >
            PEDIDO <span style={{ color: '#dc2626' }}>CONFIRMADO</span>
          </h1>
          <p className="text-rock-metal-light mb-2 text-sm">
            Recibirás un WhatsApp de confirmación en breve.
          </p>
          <p className="text-rock-metal text-xs mb-8">
            Referencia:{' '}
            <span className="text-rock-gold font-mono tracking-wider">
              #{completedOrder.id.slice(-8).toUpperCase()}
            </span>
          </p>

          <div className="bg-rock-card border border-rock-border p-6 mb-8 text-left space-y-4">
            <div>
              <p className="text-rock-metal text-xs uppercase tracking-wider mb-1">Hora de recogida</p>
              <p className="text-rock-white font-bold">
                {new Date(completedOrder.pickupTime).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="border-t border-rock-border pt-4">
              <p className="text-rock-metal text-xs uppercase tracking-wider mb-2">Resumen</p>
              {completedOrder.items.map((oi) => (
                <div key={oi.id} className="flex justify-between text-sm mb-1">
                  <span className="text-rock-metal-light">
                    {oi.quantity}× {oi.menuItem.name}
                    {oi.size && (
                      <span className="text-rock-metal text-xs ml-1">
                        ({oi.size === 'half' ? 'media' : 'entera'})
                      </span>
                    )}
                  </span>
                  <span className="text-rock-gold">{formatPrice(oi.unitPrice * oi.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-rock-border pt-4">
              <span className="text-rock-metal-light text-sm">Total</span>
              <span
                className="text-rock-gold text-2xl"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.05em' }}
              >
                {formatPrice(completedOrder.totalAmount)}
              </span>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center bg-rock-red hover:bg-rock-red-bright text-white transition-all hover:scale-[1.02]"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: '1.3rem',
              letterSpacing: '0.1em',
              padding: '0.85rem 2.5rem',
              clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
            }}
          >
            VOLVER AL INICIO
          </Link>
        </div>
      </main>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────────────
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const pizzeriaStatus = schedule ? getPizzeriaStatus(schedule) : null;

  return (
    <main className="min-h-screen pt-28">
      {pizzeriaStatus?.message && (
        <div className={`px-4 py-3 text-sm text-center font-medium ${pizzeriaStatus.open ? 'bg-yellow-900/50 text-yellow-300 border-b border-yellow-700' : 'bg-rock-card text-rock-metal-light border-b border-rock-border'}`}>
          {pizzeriaStatus.open ? '' : '🔴 '}{pizzeriaStatus.message}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:flex lg:gap-8 lg:items-start">

        {/* ── LEFT: Menu ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 mb-8 lg:mb-0">
          <h1
            className="text-rock-white mb-8"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '0.1em',
            }}
          >
            ELIGE TU <span style={{ color: '#dc2626' }}>PEDIDO</span>
          </h1>
          <MenuSection categories={categories} loading={menuLoading} />
        </div>

        {/* ── RIGHT: Cart + Form ──────────────────────────────────────── */}
        <div ref={formRef} className="lg:w-96 w-full lg:sticky lg:top-24 flex flex-col gap-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">

          {/* Cart panel */}
          <div className="bg-rock-card border border-rock-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-rock-border">
              <h2
                className="text-rock-white"
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: '1.4rem',
                  letterSpacing: '0.1em',
                }}
              >
                CARRITO
                {totalItems > 0 && (
                  <span className="ml-2 text-rock-red">{totalItems}</span>
                )}
              </h2>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-rock-metal text-xs hover:text-rock-red transition-colors"
                >
                  Vaciar
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-3xl mb-3" aria-hidden="true">🛒</p>
                <p className="text-rock-metal text-sm">
                  Añade platos desde el menú
                </p>
              </div>
            ) : (
              <div>
                <ul className="divide-y divide-rock-border" aria-label="Items en el carrito">
                  {items.map((cartItem, idx) => {
                    const key = `${cartItem.menuItem.id}-${cartItem.size ?? 'single'}-${idx}`;
                    const unitPrice =
                      cartItem.size === 'half'
                        ? (cartItem.menuItem.priceHalf ?? 0)
                        : cartItem.size === 'full'
                        ? (cartItem.menuItem.priceFull ?? 0)
                        : (cartItem.menuItem.price ?? 0);
                    return (
                      <li key={key} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-rock-white text-sm font-medium truncate">
                            {cartItem.menuItem.name}
                          </p>
                          {cartItem.size && (
                            <p className="text-rock-metal text-xs">
                              {cartItem.size === 'half' ? 'Media ración' : 'Ración entera'}
                            </p>
                          )}
                          {unitPrice > 0 && (
                            <p className="text-rock-gold text-xs">{formatPrice(unitPrice)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${cartItem.menuItem.name}`}>
                          <button
                            onClick={() =>
                              updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1, cartItem.size)
                            }
                            className="w-6 h-6 flex items-center justify-center border border-rock-border text-rock-metal hover:border-rock-red hover:text-rock-red transition-colors text-sm"
                            aria-label="Reducir cantidad"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-rock-white text-sm">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1, cartItem.size)
                            }
                            className="w-6 h-6 flex items-center justify-center border border-rock-border text-rock-metal hover:border-rock-red hover:text-rock-red transition-colors text-sm"
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(cartItem.menuItem.id, cartItem.size)}
                          className="text-rock-metal hover:text-rock-red transition-colors text-xs ml-1"
                          aria-label={`Eliminar ${cartItem.menuItem.name}`}
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="px-5 py-4 flex justify-between items-center border-t border-rock-border">
                  <span className="text-rock-metal-light text-sm">Total</span>
                  <span
                    className="text-rock-gold font-bold text-xl"
                    style={{
                      fontFamily: "'Bebas Neue', Impact, sans-serif",
                      letterSpacing: '0.05em',
                    }}
                  >
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Order form — only shown when cart has items */}
          {items.length > 0 && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="bg-rock-card border border-rock-border p-5 flex flex-col gap-4"
            >
              <h2
                className="text-rock-white"
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: '1.4rem',
                  letterSpacing: '0.1em',
                }}
              >
                DATOS DE <span style={{ color: '#dc2626' }}>RECOGIDA</span>
              </h2>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-rock-metal-light text-xs uppercase tracking-wider mb-1"
                >
                  Teléfono *
                </label>
                <div className="flex">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-rock-dark border border-rock-border border-r-0 text-rock-white px-2 py-2.5 text-sm focus:outline-none focus:border-rock-red transition-colors"
                    aria-label="Código de país"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel-national"
                      placeholder="612 345 678"
                      className="w-full bg-rock-dark border border-rock-border text-rock-white px-3 py-2.5 text-sm focus:outline-none focus:border-rock-red transition-colors"
                      {...register('phone')}
                    />
                    {lookingUpPhone && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-rock-red text-xs mt-1" role="alert">{errors.phone.message}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-rock-metal-light text-xs uppercase tracking-wider mb-1"
                >
                  Nombre *
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Tu nombre"
                  className="w-full bg-rock-dark border border-rock-border text-rock-white px-3 py-2.5 text-sm focus:outline-none focus:border-rock-red transition-colors"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-rock-red text-xs mt-1" role="alert">{errors.name.message}</p>
                )}
              </div>

              {/* Pickup time */}
              <div>
                <label
                  htmlFor="pickupTime"
                  className="block text-rock-metal-light text-xs uppercase tracking-wider mb-1"
                >
                  Hora de recogida *
                </label>
                <select
                  id="pickupTime"
                  className="w-full bg-rock-dark border border-rock-border text-rock-white px-3 py-2.5 text-sm focus:outline-none focus:border-rock-red transition-colors"
                  {...register('pickupTime')}
                >
                  <option value="">Selecciona hora...</option>
                  {(schedule ? getPickupSlots(schedule) : []).map((slot) => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
                <p className="text-rock-metal text-xs mt-1">
                  Mínimo 30 min · Mar–Dom 13:00–22:30 (último pedido)
                </p>
                {errors.pickupTime && (
                  <p className="text-rock-red text-xs mt-1" role="alert">{errors.pickupTime.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-rock-metal-light text-xs uppercase tracking-wider mb-1"
                >
                  Notas (opcional)
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Alergias, sin cebolla, extra picante..."
                  className="w-full bg-rock-dark border border-rock-border text-rock-white px-3 py-2.5 text-sm focus:outline-none focus:border-rock-red transition-colors resize-none"
                  {...register('notes')}
                />
              </div>

              {/* Geolocation badge */}
              {geoStatus !== 'idle' && (
                <div
                  className={`flex items-center gap-2 text-xs px-3 py-2 border ${
                    geoStatus === 'granted'
                      ? 'border-green-800 bg-green-900/20 text-green-400'
                      : 'border-rock-border bg-rock-dark text-rock-metal'
                  }`}
                >
                  <span aria-hidden="true">
                    {geoStatus === 'granted' ? '📍' : geoStatus === 'denied' ? '⚠️' : '⏳'}
                  </span>
                  {geoStatus === 'granted' && 'Ubicación detectada'}
                  {geoStatus === 'denied' && 'Ubicación no disponible — el pedido se procesará igualmente'}
                  {geoStatus === 'requesting' && 'Solicitando ubicación...'}
                </div>
              )}

              {/* RGPD checkboxes */}
              <div className="space-y-2 border-t border-rock-border pt-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-rock-red"
                    {...register('acceptTerms')}
                  />
                  <span className="text-rock-metal text-xs leading-relaxed">
                    Acepto los{' '}
                    <Link
                      to="/aviso-legal"
                      className="text-rock-red hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      términos y condiciones
                    </Link>{' '}
                    *
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-rock-red text-xs ml-5" role="alert">{errors.acceptTerms.message}</p>
                )}

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-rock-red"
                    {...register('acceptPrivacy')}
                  />
                  <span className="text-rock-metal text-xs leading-relaxed">
                    He leído la{' '}
                    <Link
                      to="/privacidad"
                      className="text-rock-red hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      política de privacidad
                    </Link>{' '}
                    *
                  </span>
                </label>
                {errors.acceptPrivacy && (
                  <p className="text-rock-red text-xs ml-5" role="alert">{errors.acceptPrivacy.message}</p>
                )}
              </div>

              {/* Submit error */}
              {submitError && (
                <div
                  role="alert"
                  className="bg-rock-red/10 border border-rock-red/50 text-rock-red px-4 py-3 text-sm"
                >
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-rock-red hover:bg-rock-red-bright disabled:opacity-50 text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: '1.35rem',
                  letterSpacing: '0.1em',
                  padding: '0.9rem',
                  clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
                }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" /> ENVIANDO...
                  </span>
                ) : (
                  `CONFIRMAR · ${formatPrice(totalPrice)}`
                )}
              </button>

              <p className="text-rock-metal text-xs text-center">
                Recibirás confirmación por WhatsApp · Solo para recoger en local
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Mobile floating cart button */}
      {totalItems > 0 && (
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex items-center gap-2 bg-rock-red text-white shadow-lg shadow-rock-red/30 px-4 py-3"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: '1.1rem',
              letterSpacing: '0.08em',
              clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
            }}
            aria-label={`Ver carrito con ${totalItems} items`}
          >
            🛒 {totalItems} · {formatPrice(totalPrice)}
          </button>
        </div>
      )}
    </main>
  );
}
