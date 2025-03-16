import { FixedLengthArray } from "@ctypes";
import { model, Schema } from "mongoose";

export interface IThemeColor {
  name: string;
  values: Record<string, string[]>;
}

const colorSchema = new Schema<IThemeColor>(
  {
    name: { type: String, unique: true, required: true },
    values: { type: Map, of: [String], required: true },
  },
  {
    timestamps: true,
  }
);

const ThemeColor = model<IThemeColor>("ThemeColor", colorSchema);

export default ThemeColor;
