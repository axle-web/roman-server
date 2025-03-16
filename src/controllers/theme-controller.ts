import { ControllerFactory } from "@factory/controller-factory";
import ThemeColor from "@models/theme-color-model";
import Theme from "@models/theme-model";
import { AppError, catchAsync, log } from "@utils";
import Joi from "joi";

const Controller = new ControllerFactory(Theme);
const ColorController = new ControllerFactory(ThemeColor);

export const addColorPalette = ColorController.postOne({
  body: {
    name: Joi.string().required(),
    values: Joi.object()
      .required()
      .keys({
        primary: Joi.array().length(10).items(Joi.string().required()),
        secondary: Joi.array().length(10).items(Joi.string().required()),
        accent: Joi.array().length(10).items(Joi.string().required()),
      }),
  },
  postprocess: async (req, res, next, payload) => {
    const colorTheme = await ThemeColor.create(payload);
    await Theme.findOneAndUpdate(
      {},
      { $push: { colors: colorTheme._id } },
      { new: true }
    ).then((theme) => log.info("Theme updated"));
  },
});

export const updateBackground = ColorController.updateOne({
  key: "name",
  query: {
    name: Joi.string().allow("background").required(),
  },
  body: {
    value: {
      schema: Joi.array().length(10).items(Joi.string().required()),
      setAs: "values.primary",
    },
  },
  preprocess: async (req, res, next, payload) => {
    console.log(payload);
  },
});

export const updateSelectedPalette = catchAsync(async (req, res, next) => {
  const { paletteId } = req.body;
  // check if paletteId is valid
  const palette = await ThemeColor.findById(paletteId);
  if (!palette) {
    return next(AppError.createDocumentNotFoundError("Palette"));
  }
  const theme = await Theme.findOneAndUpdate(
    {},
    { $set: { selectedPalette: paletteId } },
    { new: true }
  );
  res.status(200).json(theme);
});

export const updateSelectedColorScheme = catchAsync(async (req, res, next) => {
  const { scheme } = req.body;
  const theme = await Theme.findOneAndUpdate(
    {},
    { $set: { colorScheme: scheme } },
    { new: true }
  );
  res.status(200).json(theme);
});

export const getTheme = catchAsync(async (req, res, next) => {
  const theme = await Theme.findOne({}).populate(["colors", "background"]);
  res.status(200).json(theme);
});
export default Controller;
