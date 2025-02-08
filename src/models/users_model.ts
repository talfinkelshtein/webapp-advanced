import mongoose from "mongoose";

export interface IUser {
  email: string;
  password: string;
  username: string;
  profilePicture?: string;
  _id?: string;
  refreshToken?: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    trim: true,
  },
  profilePicture: {
    type: String,
  },
  refreshToken: {
    type: [String],
    default: [],
  },
});

userSchema.pre("save", function (next) {
  if (!this.username) {
    this.username = this.email.split("@")[0]; 
  }
  next();
});

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;