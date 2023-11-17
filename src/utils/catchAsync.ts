import { unlink } from "fs";
import { NextFunction, Request, Response } from "express";
import { log } from "./logger";

const catchAsync = (
    fn: (req: Request, res: Response, next: NextFunction) => any
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch((error: Error) => {
            if (req?.file) {
                unlink(req.file.path, (err) => err && log.error(err as any));
            }
            next(error);
        });
    };
};
export default catchAsync;
