import User, { UserRoleNames, userRoles } from "@models/user-model";
import { AppError } from "@utils";
import { catchAsync } from "@utils";

const protect = (role: UserRoleNames = "user") =>
  catchAsync(async (req, res, next) => {
    // log.debug(`Requesting authentication ${req.path}`);
    const session = req.session;
    if (!session?.user?._id) {
      throw AppError.AuthenticationError;
    }
    const user = await User.findById(session?.user?._id).select("+role");
    if (!user) {
      delete session.user;
      throw AppError.AuthenticationError;
    }
    if (userRoles[user.role] < userRoles[role]) {
      throw AppError.AuthenticationError;
    }
    req.user = user;
    // log.info(`Registered: ${user.email}`, {
    //     task: "protect_middleware",
    //     document: user,
    // });
    next();
  });

export default protect;
