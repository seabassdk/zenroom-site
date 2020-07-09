// const mongoose =require('mongoose');
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        min: 3,
        max: 255
    },
    username: {
        type: String,
        required: false,
        min: 3,
        max: 255
    },
    email: {
        type: String,
        required: false,
        max: 255,
        min: 6
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    level: {
        type: String,
        required: true,
        default: 'basic'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', userSchema);