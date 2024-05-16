import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Username should be a type of text',
    'string.empty': 'Username cannot be an empty field',
    'string.min': 'Username should have a minimum length of 3 characters',
    'string.max': 'Username should have a maximum length of 30 characters',
    'any.required': 'Please enter a username'
  }),
  phone_number: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .required()
    .messages({
      'string.base': 'Phone number should be a type of text',
      'string.empty': 'Phone number cannot be an empty field',
      'string.pattern.base': 'Phone number must contain only digits',
      'string.min': 'Phone number should have a minimum length of 10 digits',
      'string.max': 'Phone number should have a maximum length of 15 digits',
      'any.required': 'Please enter a phone number'
    }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email should be a type of text',
    'string.empty': 'Email cannot be an empty field',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Please enter an email'
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
    .messages({
      'string.base': 'Password should be a type of text',
      'string.empty': 'Password cannot be an empty field',
      'string.min': 'Password should have a minimum length of 8 characters',
      'string.max': 'Password should have a maximum length of 128 characters',
      'string.pattern.base':
        'Password must include at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
      'any.required': 'Please enter a password'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string().required().messages({
    'any.required': 'Please Enter email'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Please Enter Password'
  })
});
