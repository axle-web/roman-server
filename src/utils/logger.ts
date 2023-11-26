import path from "path";
import { config } from "dotenv";
config({
    path:
        process.env.NODE_ENV === "production"
            ? path.join(process.cwd(), ".env.production")
            : path.join(process.cwd(), ".env.local"),
});
import winston, { level } from "winston";
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
    trace	    light blue  trace
    unknown	    grey	    *   
 */

const customLevels = {
    levels: {
        debug: 0,
        info: 1,
        warning: 2,
        error: 3,
        critical: 4,
        trace: 5,
    },
    colors: {
        debug: 'blue',
        info: 'green',
        warning: 'yellow',
        error: 'red',
        critical: 'purple',
        trace: 'cyan',
    },
} as const
type LogLevel = keyof typeof customLevels['colors']


winston.addColors(customLevels.colors);
interface CustomLogger extends winston.Logger {
    success: winston.LeveledLogMethod;
}

const logger = winston.createLogger({
    level: "trace",
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

export const log = Object.keys(customLevels.levels).reduce((acc, level) => {
    acc[level as LogLevel] = (message: string, task?: string, labels?: { [key: string]: any }) =>
        _log(level as any, message, task, labels)
    return acc
}, {} as Record<LogLevel, (message: string, task?: string, labels?: { [key: string]: any }) => any>)

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(),
            winston.format.prettyPrint(),
            winston.format.simple())
    }));
}

log.trace('hi')