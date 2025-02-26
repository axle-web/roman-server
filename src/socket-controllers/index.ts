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
    {
      name,
      includeSystem,
      branch,
    }: { name?: string; includeSystem?: boolean; branch?: string },
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
        const files = await Node.find(payload)
          .populate({ path: "branch", populate: "_id name slug details" })
          .limit(20);
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
        const folders = (await Branch.find(payload)
          .populate({ path: "branch", populate: "_id name slug details" })
          .limit(20)) as unknown as FolderDocument[];
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
      const queries = [
        Node.find(payload)
          .populate({ path: "branch", select: "_id name details slug" })
          .limit(20),
        Branch.find(payload)
          .limit(20)
          .select("_id name details slug views path"),
      ];

      const [files, folders] = await Promise.all(queries);
      callback({
        data: {
          images: files as unknown as ImageDocument[],
          folders: folders as unknown as FolderDocument[],
        },
      });
    } catch (error: any) {
      callback({
        error: {
          message: error.message,
          status: 500,
          type: "FAIL",
        },
      });
    }
  });
};

export default socketFindHandlers;
