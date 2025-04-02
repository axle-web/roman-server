import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../types/socket";
import { Socket } from "socket.io";
declare const socketFindHandlers: (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => void;
export default socketFindHandlers;
