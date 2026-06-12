import imageCompression from 'browser-image-compression';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_INPUT_SIZE = 15 * 1024 * 1024;

function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    initialQuality: 0.88,
    fileType: file.type as 'image/jpeg' | 'image/png',
  });

  if (compressed.size > MAX_FILE_SIZE) {
    return imageCompression(file, {
      maxSizeMB: 1.9,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      initialQuality: 0.75,
      fileType: file.type as 'image/jpeg' | 'image/png',
    });
  }

  return compressed;
}

async function compressPdf(file: File): Promise<File> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const { jsPDF } = await import('jspdf');
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;

  let quality = 0.88;
  let scale = 1.6;

  while (quality >= 0.55) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas nuk u krijua.');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport, canvas }).promise;

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/jpeg', quality);

      if (pageNum > 1) {
        doc.addPage();
      }

      doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    }

    const blob = doc.output('blob');
    if (blob.size <= MAX_FILE_SIZE) {
      return new File([blob], file.name, { type: 'application/pdf' });
    }

    quality -= 0.08;
    scale -= 0.15;
  }

  throw new Error('PDF nuk mund të kompresohet nën 2MB. Provoni me skaner më të ulët.');
}

export async function compressFileIfNeeded(file: File): Promise<File> {
  if (file.size > MAX_INPUT_SIZE) {
    throw new Error('Skedari është shumë i madh. Maksimumi 15MB para kompresimit.');
  }

  if (file.size <= MAX_FILE_SIZE) {
    return file;
  }

  if (isImage(file)) {
    return compressImage(file);
  }

  if (isPdf(file)) {
    return compressPdf(file);
  }

  throw new Error('Lloji i skedarit nuk mbështetet për kompresim.');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
