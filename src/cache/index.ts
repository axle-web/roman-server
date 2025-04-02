import User, { IUser } from "@models/user-model";
import { log } from "@utils";
import { randomBytes } from "crypto";
import { appearanceCache } from "./app-appereance-cache";

let root: IUser = undefined as any;

export const initRootAccount = async () => {
  let email = process.env.ROOT_EMAIL;
  root = (await User.findOne({ name: "root" })) as any;
  if (!root) {
    log.warning("root account not found.. generating a new one..");
    let password = process.env.ROOT_PASSWORD;
    if (!process.env.ROOT_PASSWORD) {
      password = randomBytes(32).toString("hex");
      log.warning(
        `No 'ROOT_PASSWORD' in .env file... generating random password ${password}`
      );
    }

    if (!process.env.ROOT_EMAIL) {
      email = "root@default.com";
      log.warning(`No 'ROOT_EMAIL' in .env file... using a dummy email`);
    }
    root = await User.create({
      name: "root",
      email: email,
      password,
      role: "admin",
    });
  }
  log.debug("root account cached");
  caches.root = root;
};

const caches = {
  root,
  appearance: appearanceCache,
};

export default caches;
