import { connectDB } from '@/lib/mongodb';
import { isListaAuthenticated, unauthorizedResponse } from '@/lib/lista-auth';
import Applicant from '@/models/Applicant';

type DocumentType = 'business' | 'personal';

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

    const applicant = await Applicant.findById(applicantId).select(
      '+businessCertificateFile +businessCertificateMime +personalDocumentFile +personalDocumentMime businessCertificateName personalDocumentName'
    );

    if (!applicant) {
      return Response.json({ error: 'Aplikanti nuk u gjet.' }, { status: 404 });
    }

    const isBusiness = docType === 'business';
    const fileBuffer = isBusiness
      ? applicant.businessCertificateFile
      : applicant.personalDocumentFile;
    const mimeType = isBusiness
      ? applicant.businessCertificateMime
      : applicant.personalDocumentMime;
    const fileName = isBusiness
      ? applicant.businessCertificateName
      : applicant.personalDocumentName;

    if (!fileBuffer || !fileBuffer.length || !mimeType) {
      return Response.json(
        { error: 'Skedari nuk është i disponueshëm për shkarkim. Aplikoni përsëri.' },
        { status: 404 }
      );
    }

    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${safeFileName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return Response.json({ error: 'Gabim gjatë shkarkimit.' }, { status: 500 });
  }
}
