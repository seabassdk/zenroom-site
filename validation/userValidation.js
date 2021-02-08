//Validation
// const Joi = require('@hapi/joi');
import Joi from '@hapi/joi';

//RegisterValidation
export const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(5).required(),
        password: Joi.string().min(8).required(),
        code: Joi.string().min(5).required()
    });

    return schema.validate(data);
};

//LoginValidation
export const loginValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(5).required(),
        password: Joi.string().min(8).required()
    });
    
    //Todo: Lets validate the date before we add a user
    
    return schema.validate(data);
};

// module.exports.loginValidation = loginValidation;
// module.exports.registerValidation = registerValidation;

