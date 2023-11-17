import { MethodPropertyFileOptions } from "@factory/controller-factory/types";
import Validate from "@factory/validation";
import { catchAsync } from "@utils";
import Multer from "@utils/multer";

namespace Validation {
    const validateFiles = (props: {
        [key: string]: MethodPropertyFileOptions;
    }) => {

        const fileProps = Object.entries(props);
        if (
            fileProps.length === 1 ||
            !fileProps[0][1].count ||
            fileProps[0][1].count === 1
        ) {
            const [name, { mimetypes, required, parse, upload, count }] =
                fileProps[0];
            if (count && count > 1) {
                return Multer.uploadMany({
                    name,
                    mimetypes,
                    required,
                    parse,
                    upload,
                    count,
                });
            }
            return Multer.uploadOne({
                name,
                mimetypes,
                required,
                parse,
                upload,
            });
        } else {
            return catchAsync(async (req, res, next) => {
                next();
            });
        }
    };
}
export default Validation