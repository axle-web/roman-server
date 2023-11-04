import Branch, { IBranch } from "@models/branch-model";
import Node, { INode } from "@models/node-model";
import { log } from "@utils";
import caches from ".";
import User from "@models/user-model";
export const appearanceCache: Record<string, IBranch | INode> = {};

export const items = [
  { name: "swiper", model: Branch },
  { name: "boxes", model: Branch },
  { name: "folder_menu", model: Branch },
  { name: "contact_us", model: Node },
  { name: "footer", model: Node },
  { name: "socials", model: Node },
];

// export const initAppData = async () => {
//   let appData: any = await Branch.findOne({
//     name: "app_data",
//     type: "system",
//   }).populate<{ nodes: INode[]; branches: IBranch[] }>(["nodes", "branches"]);
//   if (!appData) {
//     appData = await Branch.create({
//       name: "app_data",
//       type: "system",
//     });
//     log.info("'app_data' not found.. generating default states...");
//   }
//   for (let item of items) {
//     const MODEL: any = item.model;
//     const doc =
//       item.model === Branch
//         ? await appData?.nodes.find((el: INode) => el.name === item.name)
//         : await appData?.branches.find((el: IBranch) => el.name === item.name);
//     if (!doc) {
//       const doc = await MODEL.create({
//         name: item.name,
//         type: "system",
//         branch: appData._id,
//       });
//       log.success(`${doc.name} successfully created`);
//     }
//     appearanceCache[item.name] = doc;
//   }
//   log.info("App data loaded...");
// };
export const initAppData = () => {
  return new Promise(async (resolve, reject) => {
    const admin = await User.findOne({ name: "server" });
    try {
      let appData: any = await Branch.findOne({
        name: "app_data",
        type: "system",
      }).populate<{ nodes: INode[]; branches: IBranch[] }>([
        "nodes",
        "branches",
      ]);
      if (!appData) {
        appData = await Branch.create({
          name: "app_data",
          type: "system",
          createdBy: admin!._id,
        });
        log.info("'app_data' not found.. generating default states...");
      }
      for (let item of items) {
        const MODEL: any = item.model;
        let doc =
          item.model === Branch
            ? await appData?.branches.find(
                (el: IBranch) => el.name === item.name
              )
            : await appData?.nodes.find((el: INode) => el.name === item.name);

        if (!doc) {
          doc = await MODEL.create({
            name: item.name,
            type: "system",
            branch: appData._id,
            createdBy: admin!._id,
          });
          if (item.model === Branch) {
            appData.branches.push(doc._id);
          } else {
            appData.nodes.push(doc._id);
          }
          log.info(`${doc.name} successfully created`);
        }
        appearanceCache[item.name] = doc;
      }
      await appData.save();
      log.success("app data cached...");
      resolve(undefined);
    } catch (error) {
      log.error("error caching appearance data");
      reject(error);
    }
  });
};
