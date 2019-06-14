const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const Task = require('../models/task')
const multer = require('multer')

router.post('/task', auth, async (req, res, next) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.send({ task })
    } catch (error) {
        res.status(400).send('error')
    }
}
)

router.get('/task/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        if (_id === req.user.id) {
            const task = await Task.find({ owner: req.user._id, })
            res.send(task)
        } else {
            return res.status(404).send()
        }

    } catch (error) {
        res.status(500).send()
    }
})

// Get/task?completed=true
// Get/task?limit=10&skip=0
// Get/task?sortBy=createdAt:desc
// ascending is 1 
// descending is -1
router.get('/task', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        console.log(sort)
    }
    try {
        const task = await Task.find({ owner: req.user._id })
            .where(match)
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip))
            .sort(sort)
        res.send(task)

    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/task/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'completed', 'task']
    const isValidOperation = updates.every((updates) => allowedUpdates.includes(updates))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates' })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }
        // console.log(task)
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/task/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send()
    }
})

const fileUpload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(doc|docx|pdf|)$/gm)) {
            return callback(new Error('file must be a PDF'))
        }
        // cb(new Error('file must be a PDF'))
        callback(undefined, true)
        // cb(undefined, false)
    }
})
router.post('/task/upload',auth, fileUpload.single('file'), (req, res) => {
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

module.exports = router;