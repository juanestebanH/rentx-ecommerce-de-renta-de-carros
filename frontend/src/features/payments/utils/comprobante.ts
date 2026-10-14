import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { jsPDF } from 'jspdf';

export interface ComprobanteData {
  idRenta: string;
  vehicleName: string;
  fechaInicio: string;
  fechaFin: string;
  metodoPagoLabel: string;
  totalLabel: string;
}

const MARGIN = 18;
const PAGE_WIDTH = 595.28;
const COLOR_ACCENT: [number, number, number] = [15, 118, 110];
const COLOR_TEXT: [number, number, number] = [44, 36, 30];
const COLOR_MUTED: [number, number, number] = [120, 110, 100];
const COLOR_RULE: [number, number, number] = [220, 222, 225];

function fechaLegible(value: string): string {
  return format(parseISO(value), "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function downloadComprobante(data: ComprobanteData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLOR_ACCENT);
  doc.text('RentX', MARGIN, 48);

  doc.setFontSize(13);
  doc.setTextColor(...COLOR_TEXT);
  doc.text('Comprobante de reserva', MARGIN, 72);

  doc.setDrawColor(...COLOR_RULE);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 86, PAGE_WIDTH - MARGIN, 86);

  let y = 116;

  const fila = (etiqueta: string, valor: string, negrita = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(etiqueta, MARGIN, y);

    doc.setFont('helvetica', negrita ? 'bold' : 'normal');
    doc.setTextColor(...COLOR_TEXT);
    doc.text(valor, PAGE_WIDTH - MARGIN, y, { align: 'right' });
    y += 24;
  };

  fila('Referencia', data.idRenta, true);
  fila('Vehículo', data.vehicleName);
  fila('Entrega', fechaLegible(data.fechaInicio));
  fila('Devolución', fechaLegible(data.fechaFin));
  fila('Método de pago', data.metodoPagoLabel);
  fila('Total en COP', data.totalLabel, true);

  doc.setDrawColor(...COLOR_RULE);
  doc.line(MARGIN, y + 4, PAGE_WIDTH - MARGIN, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  const nota =
    'Este comprobante no constituye una factura fiscal. Documento generado automáticamente por RentX (demo).';
  const lineas = doc.splitTextToSize(nota, PAGE_WIDTH - MARGIN * 2) as string[];
  doc.text(lineas, MARGIN, y + 26);

  doc.save(`comprobante-${data.idRenta}.pdf`);
}