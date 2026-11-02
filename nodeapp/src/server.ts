import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { connectDB } from "./config/db";
import aiRouter from "./router/ai.router";
import authRouter from "./router/auth.router";
import userRouter from "./router/user.router";
import { errorResponse } from "./utils/response.helper";

dotenv.config();

const app = express();
const port = process.env.PORT || 1000;

app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/ai", aiRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError) {
    res.status(400).json(errorResponse("Request body must be valid JSON"));
    return;
  }
  next(error);
});

const clientPath = path.resolve(__dirname, "../../reactapp/dist");
const clientIndex = path.join(clientPath, "index.html");

if (fs.existsSync(clientIndex)) {
  app.use(express.static(clientPath));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(clientIndex);
  });
}

connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
