import mongoose, { Schema, Document, Model } from "mongoose";

// Interface untuk data User
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Tanda '?' karena kita tidak selalu mengambilnya
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// Skema Mongoose
const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // 'select: false' agar password tidak terambil by default
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
); // Otomatis menambah createdAt dan updatedAt

// Mencegah model di-compile ulang di Next.js
const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
