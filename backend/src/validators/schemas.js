import Joi from 'joi';

/**
 * User Registration Validation Schema
 */
export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(50),
  role: Joi.string().valid('student', 'admin').default('student'),
});

/**
 * User Login Validation Schema
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * Question Creation Validation Schema
 */
export const questionSchema = Joi.object({
  subjectId: Joi.string().required(),
  topicId: Joi.string().required(),
  year: Joi.number().required().min(2000),
  questionText: Joi.string().required().min(10),
  options: Joi.array().length(4).required(),
  correctOption: Joi.number().valid(0, 1, 2, 3).required(),
  explanation: Joi.string().required().min(10),
  marks: Joi.number().valid(1, 2).default(1),
  negativeMarks: Joi.number().default(0.33),
});

/**
 * Subject Creation Validation Schema
 */
export const subjectSchema = Joi.object({
  name: Joi.string().required().min(3),
  code: Joi.string().required().min(2),
});

/**
 * Topic Creation Validation Schema
 */
export const topicSchema = Joi.object({
  name: Joi.string().required().min(3),
  subjectId: Joi.string().required(),
});

/**
 * Validation Middleware Factory
 */
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  }

  req.body = value;
  next();
};
