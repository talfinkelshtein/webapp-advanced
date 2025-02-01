import mongoose from "mongoose";

export interface IComment {
  comment: string;
  owner: string;
  postId: string;
}

export const commentSchema = new mongoose.Schema<IComment>({
  comment: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
});

const commentsModel = mongoose.model<IComment>("Comments", commentSchema);

export default commentsModel;