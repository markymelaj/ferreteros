export function formatCLP(value: number | null | undefined): string {
  if (value == null) return '$0';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '0';
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(
    value
  );
}

/**
 * Formatea cantidades inteligentemente: muestra decimales solo si los tiene.
 * Útil para áridos (1.5 m³) y productos enteros (3 unidades).
 */
export function formatQty(qty: number): string {
  if (qty == null || isNaN(qty)) return '0';
  return qty % 1 === 0
    ? String(qty)
    : new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(qty);
}

export function effectivePrice(precio: number, oferta: number | null): number {
  return oferta && oferta > 0 && oferta < precio ? oferta : precio;
}

export function discountPct(precio: number, oferta: number | null): number {
  if (!oferta || oferta >= precio) return 0;
  return Math.round(((precio - oferta) / precio) * 100);
}

export function whatsappLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function formatPhoneDisplay(phone: string): string {
  // +56 9 5784 5292
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11 && clean.startsWith('56')) {
    return `+${clean.slice(0, 2)} ${clean.slice(2, 3)} ${clean.slice(3, 7)} ${clean.slice(7)}`;
  }
  return phone;
}
