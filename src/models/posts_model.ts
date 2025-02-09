import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  content: string;
  owner: mongoose.Types.ObjectId; 
  likedBy: mongoose.Types.ObjectId[]; 
  imagePath: string;
  plantType: string;
  createdAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    content: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users", default: [] }], 
    imagePath: { type: String, required: true },
    plantType: { type: String },
  },
  { timestamps: true } 
);

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
