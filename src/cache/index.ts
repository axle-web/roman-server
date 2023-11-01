import User from "@models/user-model";
import { appearanceCache } from "./app-appereance-cache";
import { log } from "@utils";
// init cache

if (!process.env.SERVER_ACCOUNT_PASSWORD)
  throw Error("No 'SERVER_ACCOUNT_PASSWORD' in .env file");

let admin;

export const initAdminAccount = async () => {
  admin = await User.findOne({ name: "server" });
  if (!admin) {
    log.info("server account not found.. generating a new one");
    admin = await User.create({
      name: "server",
      email: "server@server.server",
      password: process.env.SERVER_ACCOUNT_PASSWORD,
      role: "admin",
    });
  }
  log.success("server account cached");
};

const caches = {
  appearance: appearanceCache,
  admin,
};

export default caches;
