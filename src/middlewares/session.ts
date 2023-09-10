import session, { Session as Session_, SessionData } from "express-session";
import MongoStore from "connect-mongo";
import { PublicUserType } from "@models/user-model";
declare module "express-session" {
    interface SessionData {
        user?: PublicUserType;
    }
}

declare module "http" {
    interface IncomingMessage {
        session: SessionData & Session_;
    }
}

namespace Session {
    export const assignUser = () => {};
}

export const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // one month
    store: MongoStore.create({
        ttl: 7 * 24 * 60 * 60, // one week
        mongoUrl: process.env.MONGODB_URL,
    }),
});
