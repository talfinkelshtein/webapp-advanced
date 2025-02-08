import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  content: string;
  owner: mongoose.Types.ObjectId; 
  postId: mongoose.Types.ObjectId; 
}

export const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users", 
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts", 
    required: true,
  },
}, { timestamps: true }); 

commentSchema.set("toJSON", {
  virtuals: true,
  transform: (_, converted) => {
    converted.id = converted._id.toString();
    delete converted._id;
    delete converted.__v;
  },
});

const commentsModel = mongoose.model<IComment>("Comment", commentSchema); 

export default commentsModel;
