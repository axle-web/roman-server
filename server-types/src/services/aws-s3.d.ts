/// <reference types="express-serve-static-core" />
/// <reference types="express-session" />
/// <reference types="multer" />
import { S3 } from "@aws-sdk/client-s3";
export declare const s3Client: S3;
declare const uploadtoSpaces: (file: string | Express.Multer.File, pathAffix?: string) => Promise<{
    path: string;
}>;
export default uploadtoSpaces;
