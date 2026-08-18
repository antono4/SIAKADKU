import PDFDocument from 'pdfkit';
import type { PassThrough } from 'stream';

interface PdfTableColumn {
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

interface PdfTableData {
  columns: PdfTableColumn[];
  rows: (string | number)[][];
}

export interface PdfReportMeta {
  title: string;
  subtitle?: string;
  institution?: string;
  metaRows?: [string, string][]; // label, value pairs (e.g. Nama, NPM)
}

/**
 * Build a PDF document into a Node Readable stream using pdfkit.
 * Returns the doc instance; caller pipes it to the response.
 */
export function createPdfDoc(): PDFKit.PDFDocument {
  return new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
}

export function writeHeader(doc: PDFKit.PDFDocument, meta: PdfReportMeta) {
  const institution = meta.institution ?? 'SIAKAD Terpadu';
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(institution, { align: 'center' });
  doc
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(meta.title, { align: 'center' });
  if (meta.subtitle) {
    doc.fontSize(10).font('Helvetica').text(meta.subtitle, { align: 'center' });
  }
  doc.moveDown(0.5);

  if (meta.metaRows && meta.metaRows.length) {
    doc.fontSize(10).font('Helvetica');
    for (const [label, value] of meta.metaRows) {
      doc.text(`${label}: ${value}`);
    }
    doc.moveDown(0.5);
  }

  // divider
  const y = doc.y;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#cccccc').lineWidth(1).stroke();
  doc.moveDown(1);
}

export function writeTable(doc: PDFKit.PDFDocument, data: PdfTableData) {
  const { columns, rows } = data;
  const startX = 50;
  const rowHeight = 22;
  const pageBottom = doc.page.height - 50;

  const drawRow = (
    vals: (string | number)[],
    isHeader: boolean,
    y: number,
  ) => {
    // background for header
    if (isHeader) {
      doc
        .rect(startX, y - 4, columns.reduce((s, c) => s + c.width, 0), rowHeight)
        .fill('#f1f5f9');
    }
    let x = startX;
    doc.fontSize(9).font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
    columns.forEach((col, i) => {
      const val = String(vals[i] ?? '');
      const align = col.align ?? 'left';
      const textOpts = {
        width: col.width,
        align: align as 'left' | 'center' | 'right',
      };
      doc.text(val, x, y, textOpts);
      x += col.width;
    });
    // bottom border
    doc
      .moveTo(startX, y + rowHeight - 6)
      .lineTo(startX + columns.reduce((s, c) => s + c.width, 0), y + rowHeight - 6)
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .stroke();
  };

  let y = doc.y;
  // header row
  drawRow(
    columns.map((c) => c.header),
    true,
    y,
  );
  y += rowHeight;

  for (const row of rows) {
    if (y > pageBottom) {
      doc.addPage();
      y = 50;
      drawRow(columns.map((c) => c.header), true, y);
      y += rowHeight;
    }
    drawRow(row, false, y);
    y += rowHeight;
  }

  doc.y = y;
}

export function writeFooter(doc: PDFKit.PDFDocument, text: string) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    const bottom = doc.page.height - 30;
    doc
      .fontSize(8)
      .fillColor('#94a3b8')
      .text(
        `${text} — halaman ${i + 1} dari ${range.count}`,
        50,
        bottom,
        { align: 'center', width: doc.page.width - 100 },
      );
  }
}

export function finalizePdf(doc: PDFKit.PDFDocument): NodeJS.ReadableStream {
  writeFooter(doc, 'SIAKAD Terpadu v2');
  doc.end();
  // pdfkit doc is itself a stream; cast for piping
  return doc as unknown as NodeJS.ReadableStream;
}

// satisfy unused import guard
void (undefined as unknown as PassThrough);
