import client from 'prom-client'
import { Express } from 'express'
import { log } from '@utils';

export const httpRequestCount = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "statusCode"],
});

export const restResponseTimeHistogram = new client.Histogram({
    name: "rest_response_time_duration_seconds",
    help: "Rest API response time in seconds",
    labelNames: ["method", "route", "status_code", "ip"],
    // buckets: [0.1, 5, 15, 50, 100, 200, 500],
});

export const databaseResponseTimeHistogram = new client.Histogram({
    name: "db_response_time_duration_seconds",
    help: "Database response time in seconds",
    labelNames: ["operation", "success"],
    // buckets: [0.1, 5, 15, 50, 100, 200, 500],
});

const startmMetricsServer = (app: Express) => {
    const collectDefaultMetrics = client.collectDefaultMetrics;
    collectDefaultMetrics();
    log.debug('Metrics server up')
    app.get("/metrics", async (req, res) => {
        res.set("Content-Type", client.register.contentType);
        return res.send(await client.register.metrics());
    });
};

export default startmMetricsServer