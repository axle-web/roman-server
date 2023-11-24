import path from "path";
import { config } from "dotenv";
config({
    path:
        process.env.NODE_ENV !== "production"
            ? path.join(process.cwd(), ".env.local")
            : path.join(process.cwd(), ".env.production"),
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
    error	    red	        err, eror, error
    warning	    yellow	    warn, warning
    info	    green	    info, information, informational, notice
    debug	    blue	    dbug, debug
    trace	    light       blue trace
    unknown	    grey	    *   
 */
const logLevels = ["debug", "info", "warning", "error", "critical", "trace",] as const;
type LogLevel = typeof logLevels[number]
const customLevels = {
    levels: logLevels.reduce((acc, level, index) => {
        acc[level] = index
        return acc
    }, {} as any)
}
// const customLevels = {
//     levels: {
//         info: 0,
//         success: 1,
//         warning: 2,
//         error: 3,
//     },
//     colors: {
//         info: "blue",
//         success: "green",
//         warning: "yellow",
//         error: "red",
//     },
// };

// winston.addColors(customLevels.colors);
interface CustomLogger extends winston.Logger {
    success: winston.LeveledLogMethod;
}

const logger = winston.createLogger({
    level: "critical",
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
const _log = (type: LogLevel,
    message: string,
    task?: string,
    labels?: { [key: string]: any }) => {
    logger.log(type, {
        message,
        labels: {
            ...labels,
            task: task || labels?.task || "NULL",
        },
    });
}

export const log = logLevels.reduce((acc, level) => {
    acc[level] = (message: string, task?: string, labels?: { [key: string]: any }) =>
        _log(level, message, task, labels)
    return acc
}, {} as Record<LogLevel, (message: string, task?: string, labels?: { [key: string]: any }) => any>)

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(),
            winston.format.prettyPrint(),
            winston.format.simple())
    }));
}