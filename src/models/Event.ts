import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";

// Interface untuk data Event
export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  images: string[]; // Array of image URLs
  spsLink?: string; // Spreadsheet link (opsional)
  creator: Schema.Types.ObjectId | IUser; // Foreign Key
  createdAt: Date;
  updatedAt: Date;
}

// Skema Mongoose
const EventSchema: Schema<IEvent> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    images: [{ type: String, required: true }], // Array of strings
    spsLink: { type: String, required: false },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User", // Merujuk ke Model 'User'
      required: true,
    },
  },
  { timestamps: true }
);

// Mencegah model di-compile ulang
const EventModel: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default EventModel;
