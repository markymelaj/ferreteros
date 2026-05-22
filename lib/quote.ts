import type { CartItem, Settings } from './types';
import { formatCLP } from './format';

export interface QuoteData {
  items: CartItem[];
  subtotal: number;
  iva: number;
  total: number;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  comuna: string;
  direccion_despacho: string;
  observaciones?: string;
}

export function buildWhatsappMessage(
  q: QuoteData,
  settings: Pick<Settings, 'nombre_ferreteria'>
): string {
  const lines: string[] = [];
  lines.push(`*NUEVA COTIZACIÓN — ${settings.nombre_ferreteria.toUpperCase()}*`);
  lines.push('');
  lines.push(`*Cliente:* ${q.cliente_nombre}`);
  lines.push(`*Teléfono:* ${q.cliente_telefono}`);
  if (q.cliente_email) lines.push(`*Email:* ${q.cliente_email}`);
  lines.push(`*Comuna:* ${q.comuna}`);
  lines.push(`*Dirección de despacho:* ${q.direccion_despacho}`);
  lines.push('');
  lines.push('*PRODUCTOS COTIZADOS:*');
  for (const it of q.items) {
    const totalItem = it.precio * it.cantidad;
    lines.push(
      `• ${it.cantidad} ${it.unidad} — ${it.nombre} — ${formatCLP(it.precio)} c/u = ${formatCLP(totalItem)}`
    );
  }
  lines.push('');
  lines.push(`*Subtotal neto:* ${formatCLP(q.subtotal)}`);
  lines.push(`*IVA 19%:* ${formatCLP(q.iva)}`);
  lines.push(`*TOTAL:* ${formatCLP(q.total)}`);
  lines.push('');
  lines.push('_Despacho a confirmar según comuna y volumen._');
  if (q.observaciones) {
    lines.push('');
    lines.push(`*Observaciones:* ${q.observaciones}`);
  }
  return lines.join('\n');
}

/**
 * Genera un PDF de la cotización usando jsPDF.
 * Se ejecuta en cliente (importación dinámica) para evitar bundling en server.
 */
export async function generateQuotePDF(
  q: QuoteData,
  settings: Pick<
    Settings,
    'nombre_ferreteria' | 'telefono_whatsapp' | 'direccion_fisica' | 'email'
  >,
  numero: string
): Promise<Blob> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  let y = 18;

  // Header barra navy
  doc.setFillColor(11, 37, 69);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(settings.nombre_ferreteria.toUpperCase(), 14, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('COTIZACIÓN', 14, 23);

  // Naranja accent
  doc.setFillColor(247, 127, 0);
  doc.rect(0, 28, W, 2, 'F');

  y = 40;
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(10);
  doc.text(`N° ${numero}`, 14, y);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, W - 14, y, {
    align: 'right'
  });

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CLIENTE', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${q.cliente_nombre}`, 14, y); y += 5;
  doc.text(`Teléfono: ${q.cliente_telefono}`, 14, y); y += 5;
  if (q.cliente_email) { doc.text(`Email: ${q.cliente_email}`, 14, y); y += 5; }
  doc.text(`Despacho: ${q.direccion_despacho}, ${q.comuna}`, 14, y); y += 8;

  // Tabla productos
  doc.setFillColor(11, 37, 69);
  doc.setTextColor(255, 255, 255);
  doc.rect(14, y, W - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CANT', 16, y + 5);
  doc.text('UNIDAD', 30, y + 5);
  doc.text('PRODUCTO', 50, y + 5);
  doc.text('P. UNIT', W - 50, y + 5, { align: 'right' });
  doc.text('TOTAL', W - 16, y + 5, { align: 'right' });
  y += 7;

  doc.setTextColor(10, 10, 10);
  doc.setFont('helvetica', 'normal');
  for (const it of q.items) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    const totalItem = it.precio * it.cantidad;
    doc.text(String(it.cantidad), 16, y + 5);
    doc.text(it.unidad, 30, y + 5);
    const nombre = it.nombre.length > 45 ? it.nombre.slice(0, 42) + '…' : it.nombre;
    doc.text(nombre, 50, y + 5);
    doc.text(formatCLP(it.precio), W - 50, y + 5, { align: 'right' });
    doc.text(formatCLP(totalItem), W - 16, y + 5, { align: 'right' });
    y += 6;
    doc.setDrawColor(230, 230, 230);
    doc.line(14, y, W - 14, y);
  }

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Subtotal neto:', W - 60, y); doc.text(formatCLP(q.subtotal), W - 16, y, { align: 'right' }); y += 5;
  doc.text('IVA 19%:', W - 60, y);       doc.text(formatCLP(q.iva), W - 16, y, { align: 'right' });      y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setFillColor(247, 127, 0);
  doc.rect(W - 80, y - 5, 66, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL:', W - 76, y + 1);
  doc.text(formatCLP(q.total), W - 16, y + 1, { align: 'right' });

  y += 14;
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Cotización referencial. Despacho y plazos sujetos a confirmación. Precios IVA incluido salvo desglose.', 14, y);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(11, 37, 69);
  doc.text(
    `${settings.direccion_fisica}  ·  ${settings.telefono_whatsapp}  ·  ${settings.email}`,
    14,
    290
  );

  return doc.output('blob');
}
