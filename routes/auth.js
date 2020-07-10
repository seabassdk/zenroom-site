// const router = require('express').Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../model/User');
// const UserData = require('../model/UserData');
// const { registerValidation, loginValidation } = require('../validation/userValidation');

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ui from "@restroom-mw/ui";
import User from '../model/User.js';
import UserData from '../model/UserData.js';
import { registerValidation, loginValidation } from '../validation/userValidation.js';

// import { router as authRoutes } from 'routes';

const router = express.Router({mergeParams: true});

router.post('/register', async (req, res) => {
    console.log('Received request to register user');
    console.log(req.body);
    //Lets validate the data before we add a user
    const { error } = registerValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create the new user
    const user = new User({
        username: req.body.username,
        password: hashedPassword
    });

    //Check if the user is already in the database
    const emailExist = await User.findOne({ username: req.body.username });

    if (emailExist) {
        console.log('User already exists!');
        return res.status(512).send('Username already exists. Please provide another :)');
    }


    try {
        const savedUser = await user.save((err) => {
            if (err) {
                console.log('Could not save USER in mongo db. Error: ');
                console.log(err);
                return res.status(501).send({ msg: 'Could not save user in db' });
            }
            const userData = new UserData({ userId: user._id, username: user.username });
            userData.save();
            console.log('saved user');
        });

        //Create and assign a token
        const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET);
        //token expires in day
        const expiresIn = 86400;
        const userId = user.userId;
        const username = user.username;

        const responseData = {
            token,
            expiresIn,
            userId,
            username
        };

        res.header('auth-token', token).send(responseData);

    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }

})

router.post('/login', async (req, res) => {
    //Lets validate the data before we add a user
    const { error } = loginValidation(req.body);
    if (error)
        return res.status(500).send(error.details[0].message);

    console.log('FINDING USER IN DB....');
    //Check if the email exists
    const user = await User.findOne({ username: req.body.username });
    if (!user)
        return res.status(500).send('Username or email incorrect');

    //Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass)
        return res.status(400).send('Username or email incorrect')

    console.log('CREATE AND ASSIGN TOKEN....');
    //Create and assign a token
    const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET);
    //token expires in day
    const expiresIn = 86400;
    const userId = user.userId;
    const username = user.username;

    const responseData = {
        token,
        expiresIn,
        userId,
        username
    };

    res.header('auth-token', token).send(responseData);
});

let username = 'four';
let objswagger;
const getUserName = () => {
    console.log('returning username from getter function: ' + username);
    return username;
}

const loadSwagger = (path) => {
    console.log('loading swagger');
    console.log(path);
    return ui.default(path)
}

router.use('/test/:user', function(req, res, next){

    next();
}, function(req, res, next){

    // return ui.default({ path: "./zencode/"});
    next();
}, ui.default({ path: "./zencode/"}));

// router.use('/test/', ui.default({ path: "./zencode/" + username}));

export default router;