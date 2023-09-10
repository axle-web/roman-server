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
import { authRouter, userRouter } from "@routers";
const app = express();
app.use(cors());
app.use(sessionMiddleware);
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

//* Prometheus setup
// const { responseTime, totalRequestCount } = require("./middleware/metrics");
// app.use(responseTime);w
// app.use(totalRequestCount);

// app.use((req, res, next) => {
//     req.io = io;
//     next();
// });

//* Routes setup
app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);

app.use(globalErrorHandler);

export default app;
