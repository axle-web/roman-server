import User from "@models/user-model";
import { log } from "@utils";
import crypto from 'crypto'

let admin;
let serverPassword = process.env.SERVER_ACCOUNT_PASSWORD;



export const initAdminAccount = async () => {
    admin = await User.findOne({ name: "server" });
    if (!admin) {
        if (!serverPassword) {
            serverPassword = crypto.randomBytes(32).toString('hex')
            log.warning("No 'SERVER_ACCOUNT_PASSWORD' in .env file.");
            log.info(`Generating random server account password: '${serverPassword}'`)
        }
        log.warning("server account not found.. generating a new one");
        admin = await User.create({
            name: "server",
            email: "server@server.server",
            password: serverPassword,
            role: "admin",
        });
    }
    log.success("server account cached");
};

const caches = {
    admin
}