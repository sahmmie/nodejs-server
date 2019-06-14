const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const Schema = mongoose.Schema;
const validator = ('validator')
const jwt = require('jsonwebtoken')

const Taskschema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
        timestamps: true
    })

const Task = mongoose.model('Task', Taskschema)
module.exports = Task