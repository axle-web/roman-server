import { Types } from "mongoose";
import { Model } from "mongoose";
export declare const userRoles: {
    readonly admin: 4;
    readonly moderator: 3;
    readonly editor: 2;
    readonly user: 1;
};
export type UserRoleNames = keyof typeof userRoles;
export type UserRoleLevels = (typeof userRoles)[UserRoleNames];
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
}
type UserTypeMethods = {
    verifyPassword: (password: string) => boolean;
    shear: (args: string) => IUser;
};
export type IUserModel = Model<IUser, {}, UserTypeMethods>;
declare const User: IUserModel;
export default User;
