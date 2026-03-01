import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  authProvider: "credentials" | "google";
  googleId?: string;
  username?: string;
  displayName?: string;
  image?: string;
  bio?: string;
  primaryGenre?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    authProvider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    googleId: { type: String },
    username: { type: String, unique: true, sparse: true },
    displayName: { type: String, default: "" },
    image: { type: String },
    bio: { type: String, maxLength: 500, default: "" },
    primaryGenre: {
      type: String,
      enum: ["Fantasy", "Sci-Fi", "Mystery", "Romance", "Horror", "Non-Fiction", "Other"],
      default: "Other",
    },
  },
  { timestamps: true }
);

// export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const User = null as any;