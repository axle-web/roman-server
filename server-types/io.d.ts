import { Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./src/types/socket";
declare const IO: (server: any) => Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export default IO;
