import { FixedLengthArray } from "@ctypes";
import { model, Schema, Types } from "mongoose";

interface ITheme {
  colorScheme: "light" | "dark" | "auto";
  fontFamily: string;
  colors: Types.ObjectId[];
  primaryShade: { light: number; dark: number };
}

export interface IThemePublic extends Omit<ITheme, "colors"> {
  colors: { name: string; values: FixedLengthArray<10, string> }[];
}

const themeSchema = new Schema<ITheme>(
  {
    colorScheme: { type: String, default: "auto" },
    fontFamily: { type: String, default: "system" },
    colors: { type: [Types.ObjectId], ref: "ThemeColor" },
    primaryShade: {
      type: { light: Number, dark: Number },
      default: { light: 6, dark: 8 },
    },
  },
  {
    timestamps: true,
  }
);

const Theme = model<ITheme>("Theme", themeSchema);

export default Theme;
