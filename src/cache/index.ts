import User from "@models/user-model";
import { log } from "@utils";
import { randomBytes } from "crypto";
import { appearanceCache } from "./app-appereance-cache";
// init cache

let admin;

export const initAdminAccount = async () => {
  const adminName = process.env.SERVER_ACCOUNT_NAME ?? "admin";
  admin = await User.findOne({ name: adminName });
  if (!admin) {
    log.warning("server account not found.. generating a new one..");
    let password = process.env.SERVER_ACCOUNT_PASSWORD;
    if (!process.env.SERVER_ACCOUNT_PASSWORD) {
      password = randomBytes(32).toString("hex");
      log.warning(
        `No 'SERVER_ACCOUNT_PASSWORD' in .env file... generating random password ${password}`
      );
    }

    admin = await User.create({
      name: adminName,
      email: process.env.SERVER_ACCOUNT_EMAIL || "admin@admin.com",
      password,
      role: "admin",
    });
  }
  log.debug("server account cached");
};

const caches = {
  admin,
  appearance: appearanceCache,
};

export default caches;
