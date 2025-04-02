/// <reference types="qs" />
/// <reference types="express" />
import { Session as Session_, SessionData } from "express-session";
import { IUserPublic } from "../models/user-model";
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
export declare const sessionMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
