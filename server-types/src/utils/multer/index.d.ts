/// <reference types="qs" />
/// <reference types="express" />
import { MethodPropertyFileOptions } from "@factory/controller-factory/types";
declare namespace Multer {
    type uploadProps = {
        name: string;
    } & MethodPropertyFileOptions;
    export const uploadOne: ({ name, mimetypes, required, parse, upload, }: uploadProps) => (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
    export const uploadMany: ({ name, mimetypes, required, parse, upload, maxSize, }: {
        name: string;
    } & MethodPropertyFileOptions & {
        maxSize?: number | undefined;
    }) => (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
    export {};
}
export default Multer;
