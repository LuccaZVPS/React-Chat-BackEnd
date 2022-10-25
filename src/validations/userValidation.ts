import joi from "joi";

export const ValidateUser = joi.object({
  username: joi.string().min(3).max(16).trim().required(),
  email: joi.string().email().min(6).max(255).required(),
  password: joi.string().min(8).max(30).required(),
});
