import { FixedLengthArray } from "@ctypes";
import { model, Schema } from "mongoose";

interface IThemeColor {
  name: string;
  values: FixedLengthArray<10, string>;
}

const colorSchema = new Schema<IThemeColor>(
  {
    name: { type: String, unique: true, required: true },
    values: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
);

const ThemeColor = model<IThemeColor>("ThemeColor", colorSchema);

export default ThemeColor;
