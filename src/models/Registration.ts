import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";
import { IEvent } from "./Event";

export interface IRegistration extends Document {
  user: Schema.Types.ObjectId | IUser;
  event: Schema.Types.ObjectId | IEvent;
}

const RegistrationSchema: Schema<IRegistration> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  {
    timestamps: true,
    unique: ["user", "event"],
  }
);

const RegistrationModel: Model<IRegistration> = mongoose.models.Registration || mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default RegistrationModel;
