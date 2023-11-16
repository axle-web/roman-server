import session, { Session as Session_, SessionData } from "express-session";
import MongoStore from "connect-mongo";
import { IUserPublic } from "@models/user-model";
declare module "express-session" {
    interface SessionData {
        user?: IUserPublic;
    }
}

declare module "http" {
    interface IncomingMessage {
        session: SessionData & Session_;
    }
}

export const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET!,
    proxy: process.env.NODE_ENV === "production" ? true : false,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production" ? true : false,
    }, // one month

    store: MongoStore.create({
        ttl: 7 * 24 * 60 * 60, // one week
        mongoUrl: process.env.MONGODB_URL,
    }),
});
