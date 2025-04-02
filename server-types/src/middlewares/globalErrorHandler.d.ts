import { AppError } from "../utils";
import { NextFunction, Request, Response } from "express";
import { Error } from "mongoose";
export interface IProdAppError {
    type: AppError["type"];
    message: string;
    status: number;
}
export declare const globalErrorHandler: (err: AppError | Error, req: Request, res: Response, next: NextFunction) => void;
