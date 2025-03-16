import ThemeColor, { IThemeColor } from "@models/theme-color-model";
import Theme, { ITheme } from "@models/theme-model";

const defaultColorPalettes: IThemeColor[] = [
  {
    name: "Default",
    values: {
      primary: [
        "#B3284A",
        "#BC405E",
        "#C45872",
        "#CD7086",
        "#AB1036",
        "#9A0E31",
        "#890D2B",
        "#780B26",
        "#670A20",
        "#56081B",
      ],
      secondary: [
        "#8b9db8",
        "#768bab",
        "#61799e",
        "#546989",
        "#475974",
        "#3a495f",
        "#2d394a",
        "#202835",
        "#131820",
        "#080A0D",
      ],
      accent: [
        "#fff8e1",
        "#ffefcb",
        "#ffdd9a",
        "#ffca64",
        "#ffba38",
        "#ffb01b",
        "#ffab09",
        "#e39500",
        "#cb8400",
        "#b07100",
      ],
    },
  },
  {
    name: "Ocean Breeze",
    values: {
      primary: [
        "#fff8df",
        "#ffefca",
        "#ffde99",
        "#ffcb63",
        "#ffbc36",
        "#ffb218",
        "#ffad03",
        "#e49700",
        "#cb8600",
        "#b07300",
      ],
      secondary: [
        "#f1f2ff",
        "#e1e2f0",
        "#c1c3da",
        "#9fa1c4",
        "#8285b1",
        "#7073a6",
        "#666aa1",
        "#55598e",
        "#4b4f80",
        "#3f4472",
      ],
      accent: [
        "#ffe7e8",
        "#ffcecf",
        "#ff9b9c",
        "#ff6466",
        "#fe3738",
        "#fe1b1a",
        "#ff090b",
        "#e40000",
        "#cb0000",
        "#b20000",
      ],
    },
  },
  {
    name: "Sunset Glow",
    values: {
      primary: [
        "#ffeaec",
        "#fcd4d7",
        "#f4a7ac",
        "#ec777e",
        "#e64f57",
        "#e3353f",
        "#e22732",
        "#c91a25",
        "#b41220",
        "#9e0419",
      ],
      secondary: [
        "#fff4e1",
        "#ffe8cc",
        "#fed09b",
        "#fdb766",
        "#fca13a",
        "#fc931d",
        "#fc8c0c",
        "#e17800",
        "#c86a00",
        "#af5a00",
      ],
      accent: [
        "#f3edff",
        "#e0d7fa",
        "#beabf0",
        "#9a7de6",
        "#7c55de",
        "#693cd9",
        "#5f30d8",
        "#4f23c0",
        "#461eac",
        "#3b1898",
      ],
    },
  },
  {
    name: "Forest Harmony",
    values: {
      primary: [
        "#e6ffee",
        "#d3f9e0",
        "#a8f2c0",
        "#7aea9f",
        "#54e382",
        "#3bdf70",
        "#2bdd66",
        "#1bc455",
        "#0bae4a",
        "#00973c",
      ],
      secondary: [
        "#e1f8ff",
        "#cbedff",
        "#9ad7ff",
        "#64c1ff",
        "#3aaefe",
        "#20a2fe",
        "#099cff",
        "#0088e4",
        "#0079cd",
        "#0068b6",
      ],
      accent: [
        "#fff8e1",
        "#ffefcb",
        "#ffdd9a",
        "#ffca64",
        "#ffba38",
        "#ffb01b",
        "#ffab09",
        "#e39500",
        "#cb8400",
        "#b07100",
      ],
    },
  },
];

const defaultBackground: IThemeColor = {
  name: "background",
  values: {
    primary: [
      "#fafafa",
      "#fafafa",
      "#fafafa",
      "#fafafa",
      "#fafafa",
      "#fafafa",
      "#242424",
      "#242424",
      "#242424",
      "#242424",
    ],
  },
};
export let appearanceCache: {
  colorPalettes: IThemeColor[];
  background: IThemeColor;
  theme: ITheme;
} | null = null;
const initAppearanceCache = async (): Promise<{
  colorPalettes: IThemeColor[];
  background: IThemeColor;
  theme: ITheme;
}> => {
  // if color palettes are not found, create them
  let colorPalettes = await ThemeColor.find({});
  if (colorPalettes.length === 0) {
    colorPalettes = await ThemeColor.insertMany(defaultColorPalettes);
  }

  // if background is not found, create it
  let background = await ThemeColor.findOne({ name: "background" });
  if (!background) {
    background = await ThemeColor.create(defaultBackground);
  }

  // if theme is not found, create it
  let theme = await Theme.findOne({});
  if (!theme) {
    theme = await Theme.create({
      colors: colorPalettes.map((c) => c._id),
      background: background?._id,
      selectedPalette: colorPalettes[0]._id,
    });
  }

  appearanceCache = { colorPalettes, background, theme };
  return appearanceCache;
};

export default initAppearanceCache;
