import joi from "joi";
export const validateLogin = joi.object({
  email: joi.string().min(6).max(255).email().required(),
  password: joi.string().min(8).max(30).required(),
});
