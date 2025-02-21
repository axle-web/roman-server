const slug = require("mongoose-slug-updater");
import path from "path";
import { config } from "dotenv";
import { log } from "@utils/logger";
import mongoose from "mongoose";
config({
  path:
    process.env.NODE_ENV !== "production"
      ? path.join(process.cwd(), ".env.local")
      : path.join(process.cwd(), ".env.production"),
});

mongoose.plugin(slug);

export function connect(callback: () => any) {
  mongoose.connect(process.env.MONGODB_URL!).then(() => {
    log.debug("DB connected!");
    callback();
  });
}
