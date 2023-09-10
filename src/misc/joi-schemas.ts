import Joi from "joi";
namespace JoiSchema {
    export const username = Joi.string()
        .required()
        .label("username")
        .min(3)
        .max(24);
    export const password = Joi.string()
        .required()
        .label("password")
        .min(8)
        .max(128)
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .message(
            "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special symbol."
        );
    export const email = Joi.string()
        .required()
        .label("email")
        .max(100)
        .email();
}

export default JoiSchema;
