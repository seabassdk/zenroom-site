// const mongoose = require('mongoose');
import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    zencode: {
        type: String,
        required: true
    },
    keys: {
        type: String,
        required: false
    },
    data: {
        type: String,
        required: false
    },
    config: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export default contractSchema;