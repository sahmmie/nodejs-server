const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail } = require('../emails/account')

router.post('/register', async (req, res, next) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
}
)

router.post('/login', async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (error) {
        res.status(400).send('error login in')
    }
}
)

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/logout/all', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/profile', auth, async (req, res) => {
    res.send(req.user)
})

router.delete('/profile/delete', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/profile/edit', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'username']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }
    catch (error) {
        res.status(400).send()
    }
})

const fileUpload = multer({
    // dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(png|jpeg|jpg|)$/gm)) {
            return callback(new Error('file must be an image'))
        }
        // cb(new Error('file must be a PDF'))
        callback(undefined, true)
        // cb(undefined, false)
    }
})
router.post('/profile/upload', auth, fileUpload.single('file'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500 }).png().toBuffer()
    req.user.image = buffer
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/profile/upload', auth, async (req, res) => {
    req.user.image = undefined
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/profile/:id/image', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.image) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.image)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router;