import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  images: string[];
  spsLink?: string;
  creator: Schema.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema<IEvent> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    images: [{ type: String, required: true }],
    spsLink: { type: String, required: false },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const EventModel: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default EventModel;
