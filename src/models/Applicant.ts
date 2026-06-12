import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplicant extends Document {
  name: string;
  surname: string;
  fullName: string;
  companyName: string;
  companyEmail: string;
  phoneNumber: string;
  selectedSpace: string;
  businessCertificateUrl: string;
  businessCertificateViewUrl: string;
  businessCertificatePublicId: string;
  businessCertificateName: string;
  businessCertificateFile?: Buffer;
  businessCertificateMime?: string;
  personalDocumentUrl: string;
  personalDocumentViewUrl: string;
  personalDocumentPublicId: string;
  personalDocumentName: string;
  personalDocumentFile?: Buffer;
  personalDocumentMime?: string;
  createdAt: Date;
}

const ApplicantSchema = new Schema<IApplicant>(
  {
    name: { type: String, required: true },
    surname: { type: String, default: '' },
    fullName: { type: String, required: true },
    companyName: { type: String, required: true },
    companyEmail: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    selectedSpace: { type: String, required: true },
    businessCertificateUrl: { type: String, required: true },
    businessCertificateViewUrl: { type: String, required: true },
    businessCertificatePublicId: { type: String, required: true },
    businessCertificateName: { type: String, required: true },
    businessCertificateFile: { type: Buffer, select: false },
    businessCertificateMime: { type: String, select: false },
    personalDocumentUrl: { type: String, required: true },
    personalDocumentViewUrl: { type: String, required: true },
    personalDocumentPublicId: { type: String, required: true },
    personalDocumentName: { type: String, required: true },
    personalDocumentFile: { type: Buffer, select: false },
    personalDocumentMime: { type: String, select: false },
  },
  { timestamps: true }
);

const Applicant: Model<IApplicant> =
  mongoose.models.Applicant || mongoose.model<IApplicant>('Applicant', ApplicantSchema);

export default Applicant;
