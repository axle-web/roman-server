import client from 'prom-client';
import { Express } from 'express';
export declare const httpRequestCount: client.Counter<"route" | "method" | "statusCode">;
export declare const restResponseTimeHistogram: client.Histogram<"route" | "ip" | "method" | "status_code">;
export declare const databaseResponseTimeHistogram: client.Histogram<"operation" | "success">;
declare const startmMetricsServer: (app: Express) => void;
export default startmMetricsServer;
