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

const router = express.Router({ mergeParams: true });

router.post('/register', async (req, res) => {
    //Check if secret code is correct
    if (process.env.SECRET_CODE !== req.body.code)
        return res.status(501).send('Wrong code! Please contact Andrea.');

    //Validate the data before we add a user
    const { error } = registerValidation(req.body);
    if (error)
        return res.status(502).send(error.details[0].message);

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create the new user
    const user = new User({
        username: req.body.username,
        password: hashedPassword
    });

    //Check if the user is already in the database
    const usernameExists = await User.findOne({ username: req.body.username });
    if (usernameExists)
        return res.status(503).send('Username already exists. Please provide another :)');

    //Save user to db
    try {
        await user.save((err) => {
            if (err) {
                return res.status(504).send({ msg: 'Technical Error: Could not save user in db' });
            }
            const userData = new UserData({ userId: user._id, username: user.username });
            userData.save();
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
        res.status(200).header('auth-token', token).send(responseData);
    } catch (err) {
        res.status(500).send(err);
    }
})

router.post('/login', async (req, res) => {
    //Lets validate the data before we add a user
    const { error } = loginValidation(req.body);
    if (error)
        return res.status(500).send(error.details[0].message);
    //Check if the email exists
    const user = await User.findOne({ username: req.body.username });
    if (!user)
        return res.status(501).send('Username or email incorrect');

    //Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass)
        return res.status(502).send('Username or email incorrect')

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

router.use('/test/:user', function (req, res, next) {

    next();
}, function (req, res, next) {

    // return ui.default({ path: "./zencode/"});
    next();
}, ui.default({ path: "./zencode/" }));

// router.use('/test/', ui.default({ path: "./zencode/" + username}));

export default router;