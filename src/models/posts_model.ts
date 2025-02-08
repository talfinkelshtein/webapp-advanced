import mongoose from "mongoose";

export interface IPost {
  id?: string;
  content: string;
  owner: string;
  likedBy: string[];
  imagePath: string;
  plantType: string;
}

const postSchema = new mongoose.Schema<IPost>({
  content: String,
  owner: {
    type: String,
    required: true,
  },
  likedBy: {
    type: [String],
    default: [],
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
