import Branch from "@models/branch-model";
import Node from "@models/node-model";
import { Socket } from "socket.io";
const includeSystemToPayload = (payload: {}, includeSystem: boolean) => {
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
    const files = await Node.find(payload);
    callback(files);
  });
  socket.on("find_folder", async (name, includeSystem = false, callback) => {
    const payload = includeSystemToPayload(
      { name: { $regex: name, $options: "i" } },
      includeSystem
    );
    const folders = await Branch.find(payload);
    callback(folders);
  });
  //   socket.on("find_any", async (name, callback) => {
  //     const files = await Node.find({ name: { $regex: name, $options: 'i' } });
  //     callback(files);
  //   });
};

export default socketFindHandlers;
