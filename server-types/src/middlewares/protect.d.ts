/// <reference types="qs" />
/// <reference types="express" />
import { UserRoleNames } from "../models/user-model";
declare const protect: (role?: UserRoleNames) => (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
export default protect;
