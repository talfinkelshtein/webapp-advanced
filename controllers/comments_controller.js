import CommentsModel from "../models/comments_model.js";

const getAllComments = async (req, res) => {
  try {
    const comments = await CommentsModel.find();
    res.send(comments);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getCommentById = async (req, res) => {
  const commentId = req.params.id;

  try {
    const comment = await CommentsModel.findById(commentId);
    if (comment) {
      res.send(comment);
    } else {
      res.status(404).send("Post not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getCommentsByPostId = async (req, res) => {
  const postId = req.params.id;

  try {
    const comment = await CommentsModel.find({ postId: postId });
    if (comment) {
      res.send(comment);
    } else {
      res.status(404).send("Post not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const createComment = async (req, res) => {
  const commentBody = req.body;
  try {
    const comment = await CommentsModel.create(commentBody);
    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const updateComment = async (req, res) => {
  const commentId = req.params.id;
  const commentBody = req.body;
  try {
    const comments = await CommentsModel.findByIdAndUpdate(
      commentId,
      commentBody,
      {
        new: true,
      }
    );
    res.status(201).send(comments);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const deleteComment = async (req, res) => {
  const commentId = req.params.id;
  try {
    const rs = await CommentsModel.findByIdAndDelete(commentId);
    res.status(200).send(rs);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export default {
  getAllComments,
  createComment,
  deleteComment,
  getCommentById,
  getCommentsByPostId,
  updateComment,
};
