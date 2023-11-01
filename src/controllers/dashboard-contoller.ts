import { catchAsync } from "@utils";
import { FolderModel } from "./folder-controller";
import { ImageModel } from "./image-controller";
import User from "@models/user-model";

export const getCounts = catchAsync(async (req, res, next) => {
  const notSystem = /system/i; // Case-insensitive regex to match "system"
  const [folders, images, users] = await Promise.all([
    FolderModel.countDocuments({ type: { $not: notSystem } }),
    ImageModel.countDocuments({ type: { $not: notSystem } }),
    User.countDocuments(),
  ]);
  res.send({ folders, images, users });
});
