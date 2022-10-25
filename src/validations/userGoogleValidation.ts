import joi from "joi";

export const validateGoogleAccount = joi.object({
  username: joi.string().min(3).max(16).required(),
  token: joi.string().required(),
});
