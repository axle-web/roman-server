export declare class AppError extends global.Error {
    name: string;
    status: number;
    type: "FAIL" | "ERROR";
    operational: boolean;
    message: string;
    stack?: string | undefined;
    constructor(message: string, status: number, name: string);
    AuthenticationError(): void;
}
export declare namespace AppError {
    const createError: (status: number, message: string, name: string) => AppError;
    const createAuthenticationError: (msg: string) => AppError;
    const AuthenticationError: AppError;
    const createDocumentNotFoundError: (label: string) => AppError;
    const DocumentNotFoundError: AppError;
    const createMulterError: (msg: string) => AppError;
    const createUploadError: (msg?: string) => AppError;
    const createMissingEnviromentVar: (label: string) => AppError;
}
