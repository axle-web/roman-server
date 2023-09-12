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
import { authRouter, nodeRouter, userRouter } from "@routers";
import rateLimit from "express-rate-limit";
const app = express();
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per `window` (here, per 1 minutes),
    standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: false, // X-RateLimit-* headers
});
app.use("/api", limiter);
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
app.use("/api/v1/node", nodeRouter);

app.use(globalErrorHandler);

export default app;
