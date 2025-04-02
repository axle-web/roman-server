export declare const initAdminAccount: () => Promise<void>;
declare const caches: {
    admin: undefined;
    appearance: Record<string, import("../models/branch-model").IBranch<{}> | import("../models/node-model").INode<{}>>;
};
export default caches;
