// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    console.log('verifying token..');
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send('Access denied');
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
}

