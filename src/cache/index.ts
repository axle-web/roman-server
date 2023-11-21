import User from "@models/user-model";
import { log } from "@utils";
import { randomBytes } from "crypto";
// init cache

let admin;

export const initAdminAccount = async () => {
    admin = await User.findOne({ name: "server" });
    if (admin) return log.success("server account cached");
    log.warning("server account not found.. generating a new one");
    let password = process.env.SERVER_ACCOUNT_PASSWORD
    if (!process.env.SERVER_ACCOUNT_PASSWORD) {
        log.warning("No 'SERVER_ACCOUNT_PASSWORD' in .env file");
        password = randomBytes(32).toString('hex')
    }

    admin = await User.create({
        name: "server",
        email: "server@server.server",
        password,
        role: "admin",
    });
    log.success("server account cached");
};

const caches = {
    admin,
};

export default caches;
