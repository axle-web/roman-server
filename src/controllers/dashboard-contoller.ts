import { catchAsync } from "@utils";
import { FolderModel } from "./folder-controller";
import { ImageModel } from "./image-controller";
import User from "@models/user-model";

export const getCounts = catchAsync(async (req, res, next) => {
  const [folders, images, users] = await Promise.all([
    FolderModel.countDocuments({ system: false }),
    ImageModel.countDocuments({ system: false }),
    User.countDocuments(),
  ]);
  res.send({ folders, images, users });
});
