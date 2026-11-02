import { Router } from "express";
import { updateMe } from "../controller/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { uploadAvatar } from "../middleware/upload.middleware";

const userRouter = Router();

userRouter.patch("/me", authenticate, uploadAvatar, updateMe);

export default userRouter;
