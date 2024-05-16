// import Joi from 'joi';

// export const registerUserSchema = Joi.object({
//   name: Joi.string()
//     .regex(/^[A-Za-z\s]+$/)
//     .min(3)
//     .max(25)
//     .required()
//     .messages({
//       'string.pattern.base': 'name must contain only letters and spaces.'
//     }),
//   bio: Joi.string()
//     .regex(/^[A-Za-z\s]+$/)
//     .min(3)
//     .max(25)
//     .required()
//     .messages({
//       'string.pattern.base': 'bio must contain only letters and spaces.'
//     }),
//   email: Joi.string().email().required(),
//   password: Joi.string().min(5).max(30).required().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).messages({
//     'string.pattern.base': 'Password should contain only letters and numbers.'
//   })
// });

// export const loginUserSchema = Joi.object({
//   email: Joi.string().email().required().messages({
//     'string.email': 'Invalid email format.',
//     'any.required': 'Email is required.'
//   }),
//   password: Joi.string().required().messages({
//     'any.required': 'Password is required.'
//   })
// });

// export const verifyOtpUserSchema = Joi.object({
//   OTP: Joi.string()
//     .regex(/^\d{6}$/)
//     .required()
//     .messages({
//       'string.pattern.base': 'OTP must be exactly 6 digits long.'
//     }),
//   email: Joi.string().required()
// });

// export const forgotPasswordUserSchema = Joi.object({
//   email: Joi.string()
//     .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
//     .required()
// });
import Joi from 'joi';

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ error: errorMessages });
  }

  next();
};

const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Please Enter Name'
  }),
  email: Joi.string().required().messages({
    'any.required': 'Please Enter email'
  }),
  bio: Joi.string().required().messages({
    'any.required': 'Please Enter Bio'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Please Enter Password'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().required().messages({
    'any.required': 'Please Enter email'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Please Enter Password'
  })
});

const newGroupSchema = Joi.object({
  groupName: Joi.string().required().messages({
    'any.required': 'Please Enter Name'
  }),
  memberIds: Joi.array().min(2).max(100).required().messages({
    'any.required': 'Please Enter Members',
    'array.min': 'Members must be at least 2',
    'array.max': 'Members must be at most 100'
  })
});

const addMemberSchema = Joi.object({
  chatId: Joi.string().required().messages({
    'any.required': 'Please Enter Chat ID'
  }),
  members: Joi.array().min(1).max(97).required().messages({
    'any.required': 'Please Enter Members',
    'array.min': 'Members must be at least 1',
    'array.max': 'Members must be at most 97'
  })
});

const removeMemberSchema = Joi.object({
  chatId: Joi.string().required().messages({
    'any.required': 'Please Enter Chat ID'
  }),
  userId: Joi.string().required().messages({
    'any.required': 'Please Enter User ID'
  })
});

const sendAttachmentsSchema = Joi.object({
  chatId: Joi.string().required().messages({
    'any.required': 'Please Enter Chat ID'
  })
});

const chatIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Please Enter Chat ID'
  })
});

const renameSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Please Enter Chat ID'
  }),
  name: Joi.string().required().messages({
    'any.required': 'Please Enter New Name'
  })
});

const sendRequestSchema = Joi.object({
  user_id: Joi.string().required().messages({
    'any.required': 'Please Enter User ID'
  })
});

const acceptRequestSchema = Joi.object({
  request_id: Joi.string().required().messages({
    'any.required': 'Please Enter Request ID'
  }),
  accept: Joi.boolean().required().messages({
    'any.required': 'Please Add Accept',
    'boolean.base': 'Accept must be a boolean'
  })
}).unknown(true);

const adminLoginSchema = Joi.object({
  secretKey: Joi.string().required().messages({
    'any.required': 'Please Enter Secret Key'
  })
});

export {
  acceptRequestSchema,
  addMemberSchema,
  adminLoginSchema,
  chatIdSchema,
  loginSchema,
  newGroupSchema,
  registerSchema,
  removeMemberSchema,
  renameSchema,
  sendAttachmentsSchema,
  sendRequestSchema,
  validate
};

// import {
//   validate,
//   registerSchema,
//   loginSchema,
//   newGroupSchema,
//   addMemberSchema,
//   removeMemberSchema,
//   sendAttachmentsSchema,
//   chatIdSchema,
//   renameSchema,
//   sendRequestSchema,
//   acceptRequestSchema,
//   adminLoginSchema
// } from './path/to/your/validators';

// app.post('/register', validate(registerSchema), registerController);
// app.post('/login', validate(loginSchema), loginController);
// app.post('/new-group', validate(newGroupSchema), newGroupController);
// app.post('/add-member', validate(addMemberSchema), addMemberController);
// app.post('/remove-member', validate(removeMemberSchema), removeMemberController);
// app.post('/send-attachments', validate(sendAttachmentsSchema), sendAttachmentsController);
// app.get('/chat/:id', validate(chatIdSchema), chatController);
// app.post('/rename', validate(renameSchema), renameController);
// app.post('/send-request', validate(sendRequestSchema), sendRequestController);
// app.post('/accept-request', validate(acceptRequestSchema), acceptRequestController);
// app.post('/admin-login', validate(adminLoginSchema), adminLoginController);
