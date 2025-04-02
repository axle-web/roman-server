import { FolderDocument } from "../controllers/folder-controller";
import { ImageDocument } from "../controllers/image-controller";
import { IBranchPublic } from "../models/branch-model";
import { INode } from "../models/node-model";
export interface ServerToClientEvents {
}
export interface ClientToServerEvents {
    find_folder: (name: string, includeSystem: boolean, callback: (folders: FolderDocument[] | IBranchPublic[]) => any) => void;
    find_file: (name: string, includeSystem: boolean, callback: (files: Array<ImageDocument | INode<Record<string, any>>>) => any) => void;
    find_any: (name: string, includeSystem: boolean, callback: (docs: {
        files: ImageDocument | INode<Record<string, any>>[];
        folders: FolderDocument[];
    }) => any) => void;
}
export interface InterServerEvents {
}
export interface SocketData {
}
