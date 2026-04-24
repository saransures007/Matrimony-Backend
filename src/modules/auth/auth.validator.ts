import Joi from 'joi';

const options = { errors: { wrap: { label: '' } } };

export const loginValidator = Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    password: Joi.string().optional(),
    otp: Joi.string().optional(),
}).options(options);

export const registerValidator = Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().required(),
    password: Joi.string().required(),
    fullname: Joi.string().required(),
    profileCreatedFor: Joi.string().optional(),
    dateOfBirth: Joi.date().iso().optional(),
    gender: Joi.string().valid('Male','Female','Other').optional(),
    maritalStatus: Joi.string().valid('Single','Divorced','Widowed','Separated').optional(),
    motherTongueId: Joi.number().optional(),
    countryId: Joi.number().optional(),
    stateId: Joi.number().optional(),
    cityId: Joi.number().optional(),
    heightId: Joi.number().optional(),
    weight: Joi.number().optional(),
    educationDegreeId: Joi.number().optional(),
    occupationRoleId: Joi.number().optional(),
    employedInId: Joi.number().optional(),
    expectedSalaryId: Joi.number().optional(),
    aboutMe: Joi.string().optional(),
}).options(options);
