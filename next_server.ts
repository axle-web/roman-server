import next from "next";
const dev = process.env.NODE_ENV !== "production";
const nextServer = next({ dev });
const handle = nextServer.getRequestHandler();
import app from "./server";
nextServer
  .prepare()
  .then(() => {
    app.get("*", (req, res) => {
      return handle(req, res);
    });
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
