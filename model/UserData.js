// const mongoose =require('mongoose');
// const Contract = require('./Contract');
import mongoose from 'mongoose';
import Contract from './Contract.js';

const indySchema = new mongoose.Schema({ 
    content: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const userDataSchema = new mongoose.Schema({ 
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    contracts: [Contract],
    zencodes: [indySchema],
    keys: [indySchema],
    datas: [indySchema],
    configs: [indySchema],
    results: [indySchema]
});

export default mongoose.model('UserData', userDataSchema);