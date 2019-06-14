const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const Schema = mongoose.Schema;
const validator = ('validator')
const jwt = require('jsonwebtoken')
const Task = require('./task')
// schemas

const Userschema = mongoose.Schema({
    name: {
        trim: true,
        type: String,
        required: true
    },
    email: {
        trim: true,
        unique: true,
        type: String,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        trim: true,
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    image: {
        type: Buffer
    }
}
    , {
        timestamps: true
    });

Userschema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

Userschema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.__v
    delete userObject.image

    return userObject
}

// Userschema.methods.getPublicProfile = function () {
//     const user = this
//     const userObject = user.toObject()

//     delete userObject.password
//     delete userObject.tokens

//     return userObject
// }

Userschema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '2d' })

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

Userschema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Delete user Task when user is removed
Userschema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

// hash password when user signsup and then save to database
Userschema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = module.exports = mongoose.model('User', Userschema);