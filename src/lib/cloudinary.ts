import { v2 as cloudinary } from 'cloudinary';
import { parseBase64File } from '@/lib/file-utils';

function configureCloudinary() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();

  if (cloudinaryUrl) {
    cloudinary.config({ secure: true });
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    secure: true,
  });
}

configureCloudinary();

export interface UploadResult {
  url: string;
  viewUrl: string;
  publicId: string;
  fileName: string;
}

type FileKind = 'pdf' | 'image';

function sanitizePublicId(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getFileExtension(fileName: string): string {
  return fileName.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || '';
}

function getFileKind(fileName: string, mimeType: string): FileKind {
  const ext = getFileExtension(fileName);
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  if (
    mimeType.startsWith('image/') ||
    ext === 'png' ||
    ext === 'jpg' ||
    ext === 'jpeg'
  ) {
    return 'image';
  }
  throw new Error('Lloji i skedarit nuk mbështetet. Përdorni PDF, PNG, ose JPG.');
}

function isPdf(fileName: string, mimePrefix?: string): boolean {
  const ext = getFileExtension(fileName);
  return mimePrefix === 'application/pdf' || ext === 'pdf';
}

function buildPdfViewUrl(publicId: string, format: string): string {
  return buildPdfPageUrl(publicId, 1, format);
}

export function buildPdfPageUrl(
  publicId: string,
  page: number,
  format = 'pdf'
): string {
  const cloudName = cloudinary.config().cloud_name || process.env.CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/pg_${page},f_jpg/${publicId}.${format}`;
}

export function parsePublicIdFromUrl(url: string): string {
  const match = url.match(/\/upload\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+)$/);
  if (!match) return '';
  return match[1].replace(/\.[^/.]+$/, '');
}

function buildUploadOptions(
  folder: string,
  publicId: string,
  fileKind: FileKind
): Record<string, string | boolean> {
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
  const options: Record<string, string | boolean> = {
    folder,
    public_id: publicId,
    overwrite: false,
  };

  if (uploadPreset) {
    options.upload_preset = uploadPreset;
  }

  if (fileKind === 'pdf') {
    options.resource_type = 'image';
    options.format = 'pdf';
  } else {
    options.resource_type = 'image';
  }

  return options;
}

async function uploadBuffer(
  buffer: Buffer,
  options: Record<string, string | boolean>
): Promise<import('cloudinary').UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, uploadResult) => {
      if (error || !uploadResult) {
        reject(error ?? new Error('Cloudinary upload failed'));
        return;
      }
      resolve(uploadResult);
    });
    uploadStream.end(buffer);
  });
}

export async function uploadToCloudinary(
  base64File: string,
  folder: string,
  fileName: string
): Promise<UploadResult> {
  const format = getFileExtension(fileName);
  const mimeType = base64File.split(';')[0].replace('data:', '');
  const fileKind = getFileKind(fileName, mimeType);
  const { buffer } = parseBase64File(base64File);
  const publicId = `${sanitizePublicId(fileName)}_${Date.now()}`;
  const uploadOptions = buildUploadOptions(folder, publicId, fileKind);

  let result: import('cloudinary').UploadApiResponse;

  try {
    result = await uploadBuffer(buffer, uploadOptions);
  } catch (error) {
    const cloudinaryError = error as { http_code?: number };
    if (fileKind === 'pdf' && cloudinaryError.http_code === 403) {
      const rawOptions: Record<string, string | boolean> = {
        ...uploadOptions,
        resource_type: 'raw',
      };
      delete rawOptions.format;
      result = await uploadBuffer(buffer, rawOptions);
    } else {
      throw error;
    }
  }

  const viewUrl =
    fileKind === 'pdf'
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
