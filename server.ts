import path from "path";
import { config } from "dotenv";
config({
    path:
        process.env.NODE_ENV !== "production"
            ? path.join(process.cwd(), ".env.local")
            : path.join(process.cwd(), ".env.production"),
});
import { connect } from "@database";
import http from "http";
import app from "./app";
// import { startmMetricsServer } from "./server-metrics"
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
import IO from "./io";
const io = IO(server);
import { log } from "@utils/logger";
import { initAdminAccount } from "src/cache";
import startmMetricsServer from "@middlewares/metrics";

//* init preferences
// const initPreferences = require("./misc/init-preferences");

connect(async () => {
    // await initPreferences();
    await initAdminAccount()
    await Promise.all([startmMetricsServer(app)])
    server.listen(PORT, () => {
        log.debug(`Server is up on port ${PORT}`, "server");
    })
});


process.on("unhandledRejection", (err: Error) => {
    log.error(err.stack as string, "server");
});

process.on("uncaughtException", (err) => {
    log.error(err.stack as string, "server");
});

process.on("warning", (err) => {
    log.warning(err.stack as string, "server");
});

module.exports = { app, io };
