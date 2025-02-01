import mongoose from "mongoose";
import { commentSchema, IComment } from "./comments_model";

export interface IPost {
  id?: string;
  content: string;
  owner: string;
  likes: number;
  imagePath: string;
  plantType: string;
}

const postSchema = new mongoose.Schema<IPost>({
  content: String,
  owner: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  imagePath: String,
  plantType: String,
});

postSchema.set("toJSON", {
  virtuals: true,
  transform: (_, converted) => {
    converted.id = converted._id.toString();
    delete converted._id;
    delete converted.__v;
  },
});

const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;