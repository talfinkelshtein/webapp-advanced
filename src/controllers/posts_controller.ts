import postModel, { IPost } from "../models/posts_model";
import BaseController from "./base_controller";

class PostsController extends BaseController<IPost> {
    constructor() {
        super(postModel);
    }
}

export default new PostsController();