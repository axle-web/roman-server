import multer_ from "multer";
import { FileMimesTypes } from "../../types";
export declare const multer_dir: string;
export declare const multer: (type: FileMimesTypes[], sizeLimit?: number) => multer_.Multer;
export default multer;
