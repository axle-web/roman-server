import path from "path";
import { config } from "dotenv";
config({
    path:
        process.env.NODE_ENV === "production"
            ? path.join(process.cwd(), ".env.production")
            : path.join(process.cwd(), ".env.local"),
});
import winston from "winston";
import WinstonLoki from "winston-loki";

const lokiTransport = new WinstonLoki({
    host: process.env.LOKI_HOST!,
    labels: { app: process.env.LOKI_APP_NAME },
});
/**
 *  level	    Color	    Supported expressions
    critical    purple	    emerg, fatal, alert, crit, critical
    error	    red	err,    eror, error
    warning	    yellow	    warn, warning
    info	    green	    info, information, informational, notice
    debug	    blue	    dbug, debug
    trace	    light       blue trace
    unknown	    grey	    *   
 */
type logLevels = "info" | "success" | "warning" | "error";
const customLevels = {
    levels: {
        info: 0,
        success: 1,
        warning: 2,
        error: 3,
    },
    colors: {
        info: "blue",
        success: "green",
        warning: "yellow",
        error: "red",
    },
};

winston.addColors(customLevels.colors);
interface CustomLogger extends winston.Logger {
    success: winston.LeveledLogMethod;
}

const logger = winston.createLogger({
    level: "error",
    transports: [lokiTransport],
    levels: customLevels.levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint(),
        winston.format.simple()
    ),
}) as CustomLogger;
/* 
    tasks:
        create
        read
        update
        delete
        other

*/

const _log = (
    type: logLevels,
    message: string,
    labels?: { [key: string]: any }
) =>
    logger.log(type, {
        message,
        labels: {
            ...labels,
            task: labels?.task || "NULL",
        },
    });

export const log = {
    info: (message: string, labels?: { [key: string]: any }) =>
        _log("info", message, labels),
    success: (message: string, labels?: { [key: string]: any }) =>
        _log("success", message, labels),
    warning: (message: string, labels?: { [key: string]: any }) =>
        _log("warning", message, labels),
    error: (message: string, labels?: { [key: string]: any }) =>
        _log("error", message, labels),
};

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(),
            winston.format.prettyPrint(),
            winston.format.simple())
    }));
}
