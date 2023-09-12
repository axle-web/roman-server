export class AppError extends global.Error {
    name: string;
    status: number;
    type: "FAIL" | "ERROR";
    operational: boolean;
    message: string;
    stack?: string | undefined;
    constructor(message: string, status: number, name: string) {
        super(message);
        this.message = message;
        this.status = status;
        this.type = `${status}`.startsWith("4") ? "FAIL" : "ERROR";
        this.operational = true;
        this.name = name || "UNDEFINED";
        Error.captureStackTrace(this, this.constructor);
    }
    AuthenticationError() {}
}

export namespace AppError {
    export const createError = (
        status: number,
        message: string,
        name: string
    ) => new AppError(message, status, name);
    export const createAuthenticationError = (msg: string) =>
        new AppError(msg, 401, "AuthenticationError");

    export const AuthenticationError = createAuthenticationError(
        '"Failed to authenticate"'
    );

    /** createDocumentNotFoundError
     *
     * @param label
     * @returns ${msg} could not be found
     */
    export const createDocumentNotFoundError = (label: string) =>
        new AppError(
            `Requested ${label} could not be found`,
            404,
            "DocumentNotFoundError"
        );
    export const DocumentNotFoundError = createDocumentNotFoundError(
        "Requsted document could not be found"
    );
}
