import { Router } from "express";
import { getImage } from "../controller/image.controller";

const imageRouter = Router();

imageRouter.get("/:id", getImage);

export default imageRouter;
