import app from "./app";
declare const io: import("socket.io").Server<import("./src/types").ClientToServerEvents, import("./src/types").ServerToClientEvents, import("./src/types").InterServerEvents, import("./src/types").SocketData>;
export { app, io };
