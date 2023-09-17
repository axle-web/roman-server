const path = require("path");
const multer = require("multer");
const AppError = require("./appError");
const catchAsync = require("./catchAsync");
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "src", "temp"));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); //Appending extension
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB in bytes
    },
});

export const uploadOne = (name, required = true) => {
    return catchAsync(async (req, res, next) => {
        this.upload.single(name)(req, res, (err) => {
            if (err) {
                // Handle the error appropriately
                return next(new AppError(400, err));
            }
            console.log(req.file);
            if (required && !req.file)
                return next(new AppError(400, "No image attached"));
            if (req.file) req.body[name] = req.file;

            return next();
        });
    });
};
