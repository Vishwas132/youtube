import * as comment from "../services/comment.js";

const postComment = async (req, res) => {
  try {
    const commentObj = await comment.newComment(req.body);
    if (!commentObj.comment) return res.sendStatus(500);
    return res.status(200).json(commentObj);
  } catch (error) {
    console.trace("error", error);
    return res.status(500).json(error);
  }
};

const getAllComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const commentObj = await comment.getAllComments(videoId);
    return res.status(200).json(commentObj);
  } catch (error) {
    console.trace("error", error);
    return res.status(500).json(error);
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentObj = await comment.deleteComment(req.body);
    if (!commentObj) return res.sendStatus(404);
    return res
      .status(200)
      .json(`Comment with id=${req.body.commentId} deleted`);
  } catch (error) {
    console.trace("error", error);
    return res.status(500).json(error);
  }
};

const editComment = async (req, res) => {
  try {
    const commentObj = await comment.editComment(req.body);
    if (!commentObj[0]) return res.sendStatus(404);
    return res.status(200).json(`Comment with id=${req.body.commentId} edited`);
  } catch (error) {
    console.trace("error", error);
    return res.status(500).json(error);
  }
};

export { postComment, getAllComments, deleteComment, editComment };
