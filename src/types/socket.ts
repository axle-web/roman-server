import { IFindHandlers } from "src/socket-controllers";

export interface ServerToClientEvents {}

export interface ClientToServerEvents extends IFindHandlers {}

export interface InterServerEvents {}

export interface SocketData {}
