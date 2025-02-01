import mongoose from "mongoose";
import { commentSchema, IComment } from "./comments_model";

export interface IPost {
  content: string;
  owner: string;
  likes: number;
  comments: IComment[];
  imagePath: string;
}

const postSchema = new mongoose.Schema<IPost>({
  content: String,
  owner: {
    type: String,
    required: true,
  },
  imagePath: String,
  comments: [commentSchema]
});

const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;