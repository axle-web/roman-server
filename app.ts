import path from "path";
import dotenv from "dotenv";
dotenv.config({
  path:
    process.env.NODE_ENV !== "production"
      ? path.join(process.cwd(), ".env.local")
      : path.join(process.cwd(), ".env.production"),
});
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import { globalErrorHandler, sessionMiddleware } from "@middlewares";
import {
  authRouter,
  branchRouter,
  dashboardRouter,
  folderRouter,
  imageRouter,
  nodeRouter,
  testRouter,
  userRouter,
  appearanceRouter,
} from "@routers";
import rateLimit from "express-rate-limit";
const app = express();
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 requests per `window` (here, per 1 minutes),
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});
app.use("/api", limiter);
if (!process.env.APP_URL) throw new Error("No 'APP_URL' in .env file");
app.use(
  cors({
    origin: process.env.APP_URL.split(","),
    credentials: true, // Include credentials (cookies) in the request
  })
);
app.use(sessionMiddleware);
// app.use(multer().any());

// for parsing application/json
app.use(bodyParser.json({ limit: "15mb" }));
// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "15mb", extended: true }));

//* Prometheus setup
// const { responseTime, totalRequestCount } = require("./middleware/metrics");
// app.use(responseTime);w
// app.use(totalRequestCount);

//* Routes setup
app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/node", nodeRouter);
app.use("/api/v1/branch", branchRouter);
// app.use("/api/v1/test", testRouter);
app.use("/api/v1/image", imageRouter);
app.use("/api/v1/folder", folderRouter);
app.use("/api/v1/admin/dashboard", dashboardRouter);
app.use("/api/v1/appearance", appearanceRouter);

app.use(globalErrorHandler);

export default app;
