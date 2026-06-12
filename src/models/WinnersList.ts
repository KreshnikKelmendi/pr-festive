import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWinnerEntry {
  applicantId: string;
  fullName: string;
  companyName: string;
  companyEmail: string;
  phoneNumber: string;
}

export interface IWinnersList extends Document {
  space: string;
  displaySpace: string;
  winners: IWinnerEntry[];
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WinnerEntrySchema = new Schema<IWinnerEntry>(
  {
    applicantId: { type: String, required: true },
    fullName: { type: String, required: true },
    companyName: { type: String, required: true },
    companyEmail: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  { _id: false }
);

const WinnersListSchema = new Schema<IWinnersList>(
  {
    space: { type: String, required: true },
    displaySpace: { type: String, required: true },
    winners: { type: [WinnerEntrySchema], required: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

const WinnersList: Model<IWinnersList> =
  mongoose.models.WinnersList ||
  mongoose.model<IWinnersList>('WinnersList', WinnersListSchema);

export default WinnersList;
