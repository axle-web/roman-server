import { AppError } from "@utils";
import bcrypt from "bcrypt";
import { hashSync } from "bcrypt";
import { Model, Schema, model } from "mongoose";
export const userRoles = {
    admin: 4,
    moderator: 3,
    editor: 2,
    user: 1,
} as const;

export type PublicUserType = UserType<false>;
export type UserRoleNames = keyof typeof userRoles; // "admin" | "moderator" | "editor" | "user"
export type UserRoleLevels = (typeof userRoles)[UserRoleNames]; // 4 | 3 | 2 | 1

export type UserType<T extends boolean = true> = {
    username: string;
    email: string;
    avatar: string;
    role: keyof typeof userRoles;
} & (T extends true
    ? { password: string; passwordChangedAt: Date }
    : {
          _id: string;
      });

type UserTypeMethods = {
    verifyPassword: (password: string) => boolean;
    shear: (args: string) => UserType;
};

export type UserModel = Model<UserType, {}, UserTypeMethods>;

const userSchema = new Schema<UserType, UserModel, UserTypeMethods>(
    {
        username: {
            type: String,
            unique: true,
            required: true,
            maxlength: 24,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            maxlength: 100,
        },
        avatar: {
            type: String,
            // unique: true,
            // required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            maxlength: 128,
            select: false,
        },
        passwordChangedAt: {
            type: Date,
            select: false,
        },
        role: {
            type: String,
            default: "user",
            enum: Object.keys(userRoles),
            select: false,
        },
    },
    { timestamps: true }
);
userSchema.method("verifyPassword", function (password: string) {
    return bcrypt.compareSync(password, this.password);
});

userSchema.method("shear", function (args: string): UserType {
    if (!this)
        throw AppError.createError(
            500,
            "DATABASE ERROR: Something went very wrong",
            "DocuemntMethodDelete"
        );
    let user = this.toJSON();
    let params = args.split(" ");
    params.forEach((arg) => delete user[arg]);
    return user;
});

userSchema.pre("save", async function (next) {
    //Only run this function if password was actually modified
    if (!this.isModified("password")) return next();
    this.password = hashSync(this.password, 12);
    this.passwordChangedAt = new Date();

    next();
});
// userSchema.methods.createPasswordResetToken = function () {
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     this.passwordResetToken = crypto
//         .createHash("sha256")
//         .update(resetToken)
//         .digest("hex");
//     this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
//     // console.log({ resetToken }, this.passwordResetToken);
//     return resetToken;
// };

const User = model<UserType, UserModel>("User", userSchema);
export default User;
