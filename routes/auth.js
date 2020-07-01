const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const UserData = require('../model/UserData');
const { registerValidation, loginValidation } = require('../validation/userValidation');


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
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    //Check if the user is already in the database
    const emailExist = await User.findOne({ email: req.body.email });

    if (emailExist)
        return res.status(400).send('Email already exists');


    try {
        const savedUser = await user.save((err) => {
            if (err) { 
                console.log('Could not save USER in mongo db. Error: ');
                console.log(err);
                return res.status(501).send({ msg: 'Could not save user in db' });
            }
            const userData = new UserData({userId: user._id});
            userData.save();
        });

        //Create and assign a token
        const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET);
        //token expires in day
        const expiresIn = 86400;
        const userId = user.id;

        const responseData = {
            token,
            expiresIn,
            userId
        };

        res.header('auth-token', token).send(responseData);

    } catch (err) {
        res.status(400).send(err);
    }

})

router.post('/login', async (req, res) => {
    console.log('LOGGING IN TO HEROKU....');
    console.log(req.body);
    //Lets validate the data before we add a user
    const { error } = loginValidation(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

        console.log('FINDING USER IN DB....');
    //Check if the email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).send('Email is not found');

        console.log('CHECKING PASSWORD....');
    //Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass)
        return res.status(400).send('Invalid password')

        console.log('CREATE AND ASSIGN TOKEN....');
    //Create and assign a token
    const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET);
    //token expires in day
    const expiresIn = 86400;
    const userId = user.id;

    const responseData = {
        token,
        expiresIn,
        userId
    };

    console.log('RESPOND....');
    res.header('auth-token', token).send(responseData);




});

router.post('/test', async (req, res) => {
    console.log('received request at test api');
    console.log(req.body);
    res.send(JSON.stringify({ msg: 'This is from the test api in the server :)' }));




});


module.exports = router;