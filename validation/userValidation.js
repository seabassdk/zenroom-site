//Validation
const Joi = require('@hapi/joi');

//RegisterValidation
const registerValidation = (data) => {
    const schema = Joi.object({
        // name: Joi.string().min(6).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()

    });

    return schema.validate(data);

};

//LoginValidation
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()

    });


    //Lets validate the date before we add a user
    return schema.validate(data);

};

module.exports.loginValidation = loginValidation;
module.exports.registerValidation = registerValidation;

