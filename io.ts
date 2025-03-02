import { Server } from "socket.io";
import { sessionMiddleware } from "@middlewares";
import { log } from "@utils";
import socketFindHandlers, {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "src/socket-controllers";
import tagSocketHandlers from "src/socket-controllers/tag-socket-controller";
const wrap = (middleware: any) => (socket: any, next: () => any) =>
  middleware(socket.request, {}, next);

const IO = (server: any) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: { origin: process.env.APP_URL!.split(","), credentials: true },
  });
  io.use(wrap(sessionMiddleware));
  io.on("connection", async (socket) => {
    log.info(`${socket.id} has connected`);
    // console.info({
    //     message: `${socket.id} has connected`,
    //     labels: {
    //         task: "socket",
    //         operation: "connection",
    //     },
    // });
    socket.onAny((eventName, ...args) => {
      console.info({
        message: `EVENT EMITTED ${eventName}`,
        labels: { task: "event" },
      });
    });

    socketFindHandlers(socket);
    tagSocketHandlers(socket);

    socket.on("disconnect", async (reason) => {
      try {
        const session = socket.request.session;

        // console.info({
        //     message: `${socket.id} has disconnected`,
        //     labels: {
        //         task: "socket",
        //         operation: "connection",
        //     },
        // });
      } catch (e) {
        console.error(e);
      }
    });
  });

  return io;
};

export default IO;
