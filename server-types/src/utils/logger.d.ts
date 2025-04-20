export declare const log: Record<"error" | "warning" | "debug" | "info" | "critical" | "trace", (message: string, task?: string, labels?: {
    [key: string]: any;
} | undefined) => any>;
