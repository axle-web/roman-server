import { IBranch } from "../models/branch-model";
import { INode } from "../models/node-model";
export declare const appearanceCache: Record<string, IBranch | INode>;
export declare const items: ({
    name: string;
    model: import("../models/branch-model").BranchModel;
    details?: undefined;
} | {
    name: string;
    model: import("../models/node-model").INodeModel;
    details: {
        address: string;
        email: string;
        phone: string;
        working_hours: {
            from: string;
            to: string;
        };
        community?: undefined;
        subtitle?: undefined;
        cover?: undefined;
        title?: undefined;
        body?: undefined;
    };
} | {
    name: string;
    model: import("../models/node-model").INodeModel;
    details: {
        community: never[];
        subtitle: string;
        address?: undefined;
        email?: undefined;
        phone?: undefined;
        working_hours?: undefined;
        cover?: undefined;
        title?: undefined;
        body?: undefined;
    };
} | {
    name: string;
    model: import("../models/node-model").INodeModel;
    details?: undefined;
} | {
    name: string;
    model: import("../models/node-model").INodeModel;
    details: {
        cover: string;
        title: string;
        body: string;
        address?: undefined;
        email?: undefined;
        phone?: undefined;
        working_hours?: undefined;
        community?: undefined;
        subtitle?: undefined;
    };
})[];
export declare const initAppData: () => Promise<unknown>;
