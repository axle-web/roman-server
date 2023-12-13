import { AppError } from "@utils";
import bcrypt from "bcrypt";
import { hashSync } from "bcrypt";
import { Document, Types } from "mongoose";
import { Model, Schema, model } from "mongoose";
export const userRoles = {
  admin: 4,
  moderator: 3,
  editor: 2,
  user: 1,
} as const;

export type UserRoleNames = keyof typeof userRoles; // "admin" | "moderator" | "editor" | "user"
export type UserRoleLevels = (typeof userRoles)[UserRoleNames]; // 4 | 3 | 2 | 1
// interface IUserInstanceCreation
//   extends Document<unknown, IUser<true>, keyof UserTypeMethods>,
//     UserTypeMethods {}

export interface IUser extends Omit<IUserPublic, "_id"> {
  _id: Types.ObjectId;
  password: string;
  passwordChangedAt?: Date;
  notifications: Types.ObjectId[];
}

export interface IUserPublic {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: keyof typeof userRoles;
};



type UserTypeMethods = {
  verifyPassword: (password: string) => boolean;
  shear: (args: string) => IUser;
};

export type IUserModel = Model<IUser, {}, UserTypeMethods>;

const userSchema = new Schema<IUser, IUserModel, UserTypeMethods>(
  {
    name: {
      type: String,
      // unique: true,
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
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
        select: false,
      },
    ],
  },
  { timestamps: true }
);
userSchema.method("verifyPassword", function (password: string) {
  return bcrypt.compareSync(password, this.password);
});

userSchema.method("shear", function (args: string): IUser {
  if (!this)
    throw AppError.createError(
      500,
      "DATABASE ERROR: Something went very wrong",
      "DocuemntMethodDelete"
    );
  let user = this.toJSON();
  let params = args.split(" ");
  params.forEach((arg) => delete user[arg as keyof IUser]);
  return user;
});

userSchema.pre("save", async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  this.password = hashSync(this.password, 12);
  this.passwordChangedAt = new Date();

  next();
});

const User = model<IUser, IUserModel>("User", userSchema);
export default User;
