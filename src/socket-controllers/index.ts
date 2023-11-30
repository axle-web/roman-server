import Branch from "@models/branch-model";
import Node from "@models/node-model";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "@ctypes/socket";
import { Socket } from "socket.io";
const includeSystemToPayload = (
  payload: {},
  includeSystem: boolean = false
) => {
  const notSystem = /system/i; // Case-insensitive regex to match "system"
  if (includeSystem) return payload;
  return { ...payload, type: { $not: notSystem } };
};

const socketFindHandlers = (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) => {
  socket.on("find_file", async (name, includeSystem = false, callback) => {
    const payload = includeSystemToPayload(
      { name: { $regex: name, $options: "i" } },
      includeSystem
    );
    const files = await Node.find(payload).limit(20);
    callback(files);
  });
  socket.on("find_folder", async (name, includeSystem = false, callback) => {
    const payload = includeSystemToPayload(
      { name: { $regex: name, $options: "i" } },
      includeSystem
    );
    const folders = await Branch.find(payload).limit(20) as any;
    callback(folders);
  });
  socket.on("find_any", async (name, includeSystem = false, callback) => {
    const payload = includeSystemToPayload(
      { name: { $regex: name, $options: "i" } },
      includeSystem
    );
    const findFiles = Node.find(payload).populate({ path: 'branch', select: "_id name" }).limit(20);
    const findFolders = Branch.find(payload).limit(20) as any;
    Promise.all([findFiles, findFolders])
      .then(([files, folders]) => {
        callback({ files, folders });
      })
      .catch(error => {
        // Handle errors here
        console.error(error);
      });
  });
};

export default socketFindHandlers;
