import Joi from "joi";
declare namespace JoiSchema {
    const username: Joi.StringSchema<string>;
    const password: Joi.StringSchema<string>;
    const email: Joi.StringSchema<string>;
    const _id: Joi.StringSchema<string>;
    const name: Joi.StringSchema<string>;
    const title: Joi.StringSchema<string>;
}
export default JoiSchema;
