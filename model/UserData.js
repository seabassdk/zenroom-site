const mongoose =require('mongoose');
const Contract = require('./Contract');

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

module.exports = mongoose.model('UserData', userDataSchema);