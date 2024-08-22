const Joi = require("joi");

// User registration validation schema
const joiRegisterSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
  confirm_password: Joi.string().min(4).required(),
});

// User login validation schema
const joiLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Product creation validation schema
const joiCreateProductSchema = Joi.object({
  name: Joi.string().min(3).required(),
  category: Joi.string().required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().optional(),
});

module.exports = {
  joiRegisterSchema,
  joiLoginSchema,
  joiCreateProductSchema,
};
