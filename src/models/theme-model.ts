import { FixedLengthArray } from "@ctypes";
import { model, Schema, Types } from "mongoose";

export interface ITheme {
  _id: Types.ObjectId;
  colorScheme: "light" | "dark" | "auto";
  fontFamily: string;
  colors: Schema.Types.ObjectId[];
  primaryShade: { light: number; dark: number };
  background: Schema.Types.ObjectId;
  selectedPalette: Schema.Types.ObjectId;
}

export interface IThemePublic extends Omit<ITheme, "colors" | "background"> {
  colors: { name: string; values: FixedLengthArray<10, string> }[];
  background: { name: string; values: FixedLengthArray<10, string> };
}

const themeSchema = new Schema<ITheme>(
  {
    colorScheme: { type: String, default: "auto" },
    fontFamily: { type: String, default: "system" },
    colors: { type: [Schema.Types.ObjectId], ref: "ThemeColor" },
    primaryShade: {
      type: { light: Number, dark: Number },
      default: { light: 6, dark: 8 },
    },
    background: { type: Schema.Types.ObjectId, ref: "ThemeColor" },
    selectedPalette: { type: Schema.Types.ObjectId, ref: "ThemePalette" },
  },
  {
    timestamps: true,
  }
);

const Theme = model<ITheme>("Theme", themeSchema);

export default Theme;
