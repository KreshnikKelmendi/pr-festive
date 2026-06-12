import { connectDB } from '@/lib/mongodb';
import { isListaAuthenticated, unauthorizedResponse } from '@/lib/lista-auth';
import Applicant from '@/models/Applicant';
import { buildPdfPageUrl, parsePublicIdFromUrl } from '@/lib/cloudinary';

type DocumentType = 'business' | 'personal';

async function getCloudinaryPdfPages(publicId: string): Promise<string[]> {
  const pages: string[] = [];

  for (let page = 1; page <= 30; page++) {
    const url = buildPdfPageUrl(publicId, page);
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) break;
    pages.push(url);
  }

  return pages;
}

export async function GET(req: Request) {
  if (!(await isListaAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(req.url);
    const applicantId = searchParams.get('id');
    const docType = searchParams.get('type') as DocumentType | null;

    if (!applicantId || !docType) {
      return Response.json({ error: 'Parametrat mungojnë.' }, { status: 400 });
    }

    await connectDB();

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return Response.json({ error: 'Aplikanti nuk u gjet.' }, { status: 404 });
    }

    const isBusiness = docType === 'business';
    const cloudinaryUrl = isBusiness
      ? applicant.businessCertificateUrl
      : applicant.personalDocumentUrl;
    const publicId = isBusiness
      ? applicant.businessCertificatePublicId
      : applicant.personalDocumentPublicId;
    const fileName = isBusiness
      ? applicant.businessCertificateName
      : applicant.personalDocumentName;

    const resolvedPublicId = publicId || parsePublicIdFromUrl(cloudinaryUrl);
    if (!resolvedPublicId) {
      return Response.json({ error: 'Dokumenti nuk u gjet.' }, { status: 404 });
    }

    const isPdf = fileName.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      const viewUrl = isBusiness
        ? applicant.businessCertificateViewUrl
        : applicant.personalDocumentViewUrl;
      return Response.json({ pages: [viewUrl || cloudinaryUrl], type: 'image' });
    }

    const pages = await getCloudinaryPdfPages(resolvedPublicId);

    if (pages.length === 0) {
      return Response.json({ error: 'Dokumenti nuk u gjet.' }, { status: 404 });
    }

    return Response.json({ pages, type: 'pdf_pages' });
  } catch (error) {
    console.error('Document pages error:', error);
    return Response.json({ error: 'Gabim gjatë ngarkimit të faqeve.' }, { status: 500 });
  }
}
