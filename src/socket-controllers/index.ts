import Branch, { IBranchPublic } from "@models/branch-model";
import Node, { INode } from "@models/node-model";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@ctypes/socket";
import { Socket } from "socket.io";
import { FolderDocument, ImageDocument } from "@ctypes";
import { IProdAppError } from "@middlewares";
import { AppError } from "@utils";

interface Payload<T extends any> {
  data?: T;
  error?: IProdAppError;
}

export interface IFindHandlers {
  find_folders: (
    { name, includeSystem }: { name: string; includeSystem?: boolean },
    callback: (payload: Payload<FolderDocument[] | IBranchPublic[]>) => any
  ) => void;
  find_images: (
    { name, includeSystem }: { name: string; includeSystem?: boolean },
    callback: (
      payload: Payload<Array<ImageDocument | INode<Record<string, any>>>>
    ) => any
  ) => void;
  find_any: (
    { name, includeSystem }: { name: string; includeSystem?: boolean },
    callback: (
      payload: Payload<{
        images: (ImageDocument | INode<Record<string, any>>)[];
        folders: FolderDocument[];
      }>
    ) => any
  ) => void;
}

const socketFindHandlers = (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) => {
  socket.on(
    "find_images",
    async ({ name, includeSystem = false }, callback) => {
      try {
        const payload = {
          name: { $regex: name, $options: "i" },
          system: includeSystem,
        };
        const files = await Node.find(payload).limit(20);
        callback({ data: files });
      } catch (e: any) {
        console.log(e);
        callback({ error: { message: e.message, status: 500, type: "FAIL" } });
      }
    }
  );
  socket.on(
    "find_folders",
    async ({ name, includeSystem = false }, callback) => {
      try {
        const payload = {
          name: { $regex: name, $options: "i" },
          system: includeSystem,
        };
        const folders = (await Branch.find(payload).limit(
          20
        )) as unknown as FolderDocument[];
        callback({ data: folders });
      } catch (e: any) {
        callback({ error: { message: e.message, status: 500, type: "FAIL" } });
      }
    }
  );
  socket.on("find_any", async ({ name, includeSystem = false }, callback) => {
    try {
      const payload = {
        name: { $regex: name, $options: "i" },
        system: includeSystem,
      };
      const findFiles = Node.find(payload)
        .populate({ path: "branch", select: "_id name" })
        .limit(20);
      const findFolders = Branch.find(payload).limit(20) as any;
      Promise.all([findFiles, findFolders])
        .then(([files, folders]) => {
          console.log(files, folders);
          callback({ data: { images: files, folders } });
        })
        .catch((error) => {
          console.log(error);
          // Handle errors here
          throw AppError.createError(
            500,
            error.message,
            "SocketFindHandlersError"
          );
        });
    } catch (e: any) {
      console.log(e);
      callback({ error: { message: e.message, status: 500, type: "FAIL" } });
    }
  });
};

export default socketFindHandlers;
