import Joi from 'joi';

const options = { errors: { wrap: { label: '' } } };

export const loginValidator = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().optional(),
  otp: Joi.string().optional(),
}).options(options);

export const registerValidator = Joi.object({
  account: Joi.object({
    email: Joi.string().email().optional().allow(null, ''),
    phone: Joi.string().required(),
    password: Joi.string().min(6).required(),
    roles: Joi.array().items(Joi.string()).optional(),
    displayName: Joi.string().optional(),
  }).required(),

  profile: Joi.object({
    fullname: Joi.string().required(),
    profileCreatedFor: Joi.string().optional(),

    // Accepts full ISO datetime: "1990-05-15T14:30:00.000"
dateOfBirth: Joi.string()
  .custom((value, helpers) => {
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      return helpers.error('any.invalid');
    }
    return value;
  })
  .required()
  .messages({ 'any.invalid': 'Invalid ISO datetime' }),

    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    maritalStatus: Joi.string()
      .valid('Single', 'Divorced', 'Widowed', 'Separated')
      .optional(),
    religionId: Joi.number().integer().positive().optional().allow(null),
    sectId: Joi.number().integer().positive().optional().allow(null),
    motherTongueId: Joi.number().integer().positive().optional().allow(null),
    casteId: Joi.number().integer().positive().optional().allow(null),
    subcasteId: Joi.number().integer().positive().optional().allow(null),
    kulamId: Joi.number().integer().positive().optional().allow(null),
    countryId: Joi.number().integer().positive().optional().allow(null),
    stateId: Joi.number().integer().positive().optional().allow(null),
    cityId: Joi.number().integer().positive().optional().allow(null),
    heightId: Joi.number().integer().positive().optional().allow(null),
    weight: Joi.number().optional().allow(null),
    educationDegreeId: Joi.number().integer().positive().optional().allow(null),
    occupationRoleId: Joi.number().integer().positive().optional().allow(null),
    employedInId: Joi.number().integer().positive().optional().allow(null),
    expectedSalaryId: Joi.number().integer().positive().optional().allow(null),
    aboutMe: Joi.string().optional().allow(null, ''),
    matrimonyModeId: Joi.number().integer().positive().optional().allow(null),
  }).required(),
}).options(options);