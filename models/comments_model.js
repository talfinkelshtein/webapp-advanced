import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema({
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

const commentsModel = mongoose.model("Comments", commentsSchema);

export default commentsModel;
