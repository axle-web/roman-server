import { model, Schema } from "mongoose";

export interface ITag {
  name: string;
  slug: string;
}

const tagSchema = new Schema<ITag>({
  name: { type: String, unique: true, required: true },
  slug: { type: String, unique: true, slug: "name" },
});

const Tag = model<ITag>("Tag", tagSchema);

export default Tag;
