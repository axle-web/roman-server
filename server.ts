import { log } from "@utils/logger";
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
import IO from "./io";
import { initAppData } from "src/cache/app-appereance-cache";
import { initAdminAccount } from "src/cache";
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = IO(server);

// import { startmMetricsServer } from "./server-metrics"

connect(async () => {
  // await initPreferences();
  await initAdminAccount()
  await Promise.all([initAppData()])
  server.listen(PORT, () => {
    // startmMetricsServer();
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

export { app, io };
