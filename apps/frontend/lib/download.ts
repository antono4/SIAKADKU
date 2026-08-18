import { api } from './api';

export async function downloadPdf(path: string, fallbackName: string) {
  const blob = await api.download(path);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cd = blob.type === 'text/csv'
    ? `${fallbackName}.csv`
    : `${fallbackName}.pdf`;
  a.download = cd;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function openPrintablePdf(path: string) {
  const blob = await api.download(path);
  const url = window.URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) {
    w.addEventListener('load', () => {
      w.focus();
      w.print();
    });
  }
  setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
}
