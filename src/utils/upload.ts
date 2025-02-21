import { uploadtoSpaces } from "@services";
import { readFileSync } from "fs";
export namespace Upload {
  export const toSpaces = async (file: Express.Multer.File) => {
    const { path } = await uploadtoSpaces(file);
    return path;
  };
  export const toBase64 = (file: Express.Multer.File) => {
    return `data:image/png;base64,${readFileSync(file.path, {
      encoding: "base64",
    })}`;
  };
  export const envDynamicUpload =
    process.env.NODE_ENV === "production" ? toSpaces : toBase64;
}
