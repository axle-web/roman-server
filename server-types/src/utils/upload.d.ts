/// <reference types="express-serve-static-core" />
/// <reference types="express-session" />
/// <reference types="multer" />
export declare namespace Upload {
    const toSpaces: (file: Express.Multer.File) => Promise<string>;
    const toBase64: (file: Express.Multer.File) => string;
    const envDynamicUpload: ((file: Express.Multer.File) => Promise<string>) | ((file: Express.Multer.File) => string);
}
