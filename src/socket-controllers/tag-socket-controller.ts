import { IProdAppError } from "@middlewares";
import Tag, { ITag } from "@models/tag-model";
import { ISocket } from ".";

export interface ITagSocketHandlers {
  find_tag: (
    payload: { name: string },
    callback: (payload: { data?: ITag[]; error?: IProdAppError }) => void
  ) => void;
}

const tagSocketHandlers = (socket: ISocket) => {
  socket.on("find_tag", async ({ name }, callback) => {
    try {
      const payload = {
        name: { $regex: name, $options: "i" },
      };
      const tags = await Tag.find(payload).limit(20);
      callback({ data: tags });
    } catch (e: any) {
      callback({ error: { message: e.message, status: 500, type: "FAIL" } });
    }
  });
};
export default tagSocketHandlers;
