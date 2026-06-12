import { connectDB } from '@/lib/mongodb';
import { getDocumentViewUrl } from '@/lib/cloudinary';
import { isListaAuthenticated, unauthorizedResponse } from '@/lib/lista-auth';
import Applicant from '@/models/Applicant';

export async function GET() {
  if (!(await isListaAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    await connectDB();

    const applicants = await Applicant.find({}).sort({ createdAt: -1 }).lean();

    const result = applicants.map((applicant) => ({
      ...applicant,
      businessCertificateViewUrl:
        applicant.businessCertificateViewUrl ||
        getDocumentViewUrl(
          applicant.businessCertificateUrl,
          applicant.businessCertificatePublicId || '',
          applicant.businessCertificateName
        ),
      personalDocumentViewUrl:
        applicant.personalDocumentViewUrl ||
        getDocumentViewUrl(
          applicant.personalDocumentUrl,
          applicant.personalDocumentPublicId || '',
          applicant.personalDocumentName
        ),
    }));

    return Response.json(result);
  } catch (error) {
    console.error('Fetch applicants error:', error);
    return Response.json({ error: 'Gabim gjatë marrjes së aplikantëve.' }, { status: 500 });
  }
}
