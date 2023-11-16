import { catchAsync } from "@utils";
import { AppError } from "@utils/appError";
import multer from "./multer-config";
import { MethodPropertyFileOptions } from "@factory/controller-factory/types";
namespace Multer {
    type uploadProps = { name: string } & MethodPropertyFileOptions;

    export const uploadOne = ({
        name,
        mimetypes,
        required,
        parse,
        upload,
    }: uploadProps) =>
        catchAsync(async (req, res, next) => {
            multer(mimetypes).single(name)(req, res, async (err) => {
                if (err) return next(err);
                if (required && !req.file)
                    return next(AppError.createMulterError("No file attached"));
                if (req.file) {
                    if (upload) {
                        let result = await upload(req.file);
                        req["body"][name] = result;
                    }
                    if (parse) {
                        let result = parse(req.file);
                        req["body"][name] = result;
                    }
                }
                next();
            });
        });
        export const uploadMany = ({
            name,
            mimetypes,
            required,
            parse,
            upload,
            maxSize, // Add maxSize property for size restrictions
          }: uploadProps & { maxSize?: number }) =>
            catchAsync(async (req, res, next) => {
              multer(mimetypes).array(name)(req, res, async (err) => {
                if (err) return next(err);
                if (required && !req.files)
                  return next(AppError.createMulterError("No files attached"));
                if (req.files) {
                  const files = Array.isArray(req.files)
                    ? req.files
                    : Object.values(req.files).reduceRight((files) => files);
                  if (
                    maxSize &&
                    files.some((file: Express.Multer.File) => file.size > maxSize)
                  ) {
                    return next(
                      AppError.createMulterError("File size exceeds the limit")
                    );
                  }
                  if (upload) {
                    const results = await Promise.all(
                      files.map(async (file: Express.Multer.File) => upload(file))
                    );
                    req["body"][name] = results;
                  }
                  if (parse) {
                    const results = files.map(parse);
                    req["body"][name] = results;
                  }
                }
                next();
              });
            });
}

export default Multer;
