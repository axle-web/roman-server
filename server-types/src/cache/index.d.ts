import { IUser } from "../models/user-model";
export declare const initRootAccount: () => Promise<void>;
declare const caches: {
    root: IUser;
    appearance: Record<string, import("../models/branch-model").IBranch<{}> | import("../models/node-model").INode<{}>>;
};
export default caches;
