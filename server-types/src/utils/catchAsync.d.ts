import { NextFunction, Request, Response } from "express";
declare const catchAsync: (fn: (req: Request, res: Response, next: NextFunction) => any) => (req: Request, res: Response, next: NextFunction) => void;
export default catchAsync;
