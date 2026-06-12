import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  viewUrl: string;
  publicId: string;
  fileName: string;
}

function sanitizePublicId(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getFileExtension(fileName: string): string {
  return fileName.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || '';
}

function isPdf(fileName: string, mimePrefix?: string): boolean {
  return mimePrefix === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
}

function isImage(fileName: string): boolean {
  return /\.(jpe?g|png)$/i.test(fileName);
}

function buildPdfViewUrl(publicId: string, format: string): string {
  return buildPdfPageUrl(publicId, 1, format);
}

export function buildPdfPageUrl(
  publicId: string,
  page: number,
  format = 'pdf'
): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/pg_${page},f_jpg/${publicId}.${format}`;
}

export function parsePublicIdFromUrl(url: string): string {
  const match = url.match(/\/upload\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+)$/);
  if (!match) return '';
  return match[1].replace(/\.[^/.]+$/, '');
}

export async function uploadToCloudinary(
  base64File: string,
  folder: string,
  fileName: string
): Promise<UploadResult> {
  const format = getFileExtension(fileName);
  const isPdfFile = isPdf(fileName, base64File.split(';')[0].replace('data:', ''));

  const result = await cloudinary.uploader.upload(base64File, {
    folder,
    public_id: sanitizePublicId(fileName),
    resource_type: 'image',
    format: isPdfFile ? 'pdf' : undefined,
    access_mode: 'public',
  });

  const viewUrl = isPdfFile
    ? buildPdfViewUrl(result.public_id, result.format || format || 'pdf')
    : result.secure_url;

  return {
    url: result.secure_url,
    viewUrl,
    publicId: result.public_id,
    fileName,
  };
}

export function getDocumentViewUrl(
  url: string,
  publicId: string,
  fileName: string
): string {
  const resolvedPublicId = publicId || parsePublicIdFromUrl(url);
  if (isPdf(fileName) && resolvedPublicId) {
    const format = getFileExtension(fileName) || 'pdf';
    return buildPdfViewUrl(resolvedPublicId, format);
  }
  return url;
}

export default cloudinary;
