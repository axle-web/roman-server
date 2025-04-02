export declare const log: Record<"debug" | "info" | "warning" | "error" | "critical" | "trace", (message: string, task?: string, labels?: {
    [key: string]: any;
} | undefined) => any>;
