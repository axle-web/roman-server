import { Types, Model } from "mongoose";
export interface INotification {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    message: string;
    isRead: boolean;
}
export interface INotificationPublic extends Omit<INotification, "_id"> {
    _id: string;
}
export interface INotificationPublic extends Omit<INotification, '_id'> {
    _id: string;
}
type INotificationModelMethods = {};
export type INotificationModel = Model<INotification, {}, INotificationModelMethods>;
declare const Notification: INotificationModel;
export default Notification;
