import { IPopoulateMap } from "./types";
export declare function applySetAsToPayload(schema: any, payload: any): any;
export declare const parsePopulateFromQuery: (keys: string | string[], populateMap: IPopoulateMap) => import("./types").PopulateFieldElement | import("./types").PopulateFieldElement[] | undefined;
