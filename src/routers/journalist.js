const ObjectId = require('bson')
const express = require('express')
const router = new express.Router()
const Journalist = require('../models/journalist')
const auth = require('../middelware/auth')
const multer = require('multer')

const upload = multer({
    limits: {
        fieldSize: 100000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Please upload an image file'))
        }
        cb(null, true)
    }
})

router.post('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        req.journalist.avatar = req.file.buffer
        await req.journalist.save()
        res.status(200).send('Image Uploaded')
    } catch (e) {
        res.status(400).send('Error: ', e)
    }
})


router.get('/allJournalists', auth, (req, res) => {
    Journalist.find({})
        .then((journalist) => {
            res.status(200).send(journalist)
        }).catch((e) => {
            res.status(400).send('Error: ', e)
        })
})

router.get('/allJournalists/:id', auth, (req, res) => {
    const _id = req.params.id
    Journalist.findOne(_id)
        .then((journalist) => {
            if (!journalist) {
                return res.status(400).send(`can't find user`)
            }
            res.status(200).send(journalist)
        }).catch((e) => {
            res.status(500).send('Error: ', e)
        })
})

router.post('/addJournalist', async (req, res) => {
    try {
        const journalist = new Journalist(req.body)
        await journalist.save()
        await journalist.generateToken()
        res.status(200).send({
            journalist
        })
    } catch (e) {
        res.status(400).send('Error: ', e)
    }
})

router.patch('/updateJournalist/:id', auth, async (req, res) => {
    const updates = ObjectId.keys(req.body)
    const allowedUpdates = ['name', 'phone', 'password', 'avatar']
    const isValid = updates.every((update) => allowedUpdates.includes(update))
    if (!isValid) {
        return res.status(400).send('Can not Update')
    }
    const _id = req.params.id
    try {
        const journalist = await Journalist.findById(_id)
        updates.forEach(update => journalist[update] = req.body[update])
        await journalist.save()
        res.status(200).send(journalist)
    } catch (e) {
        res.status(400).send('Error: ', e)
    }
})

router.delete('/deleteJournalist/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const journalist = await Journalist.findById(_id)
        if (!journalist) {
            return res.status(404).send('Journalist Not Found')
        }
        res.status(200).send(journalist)
    } catch (e) {
        res.status(400).send('Error: ', e)
    }
})

router.post('/login', async (req, res) => {
    try {
        const journalist = await Journalist.findByCredentials(req.body.email, req.boy.password)
        const token = await journalist.generateToken()
        res.status(200).send({
            journalist,
            token
        })
    } catch (e) {
        res.status(500).send('Error: ', e)
    }
})

router.delete('/logout', auth, async (req, res) => {
    try {
        req.journalist.tokens = req.journalist.tokens.filter((el) => {
            return el.token !== req.token
        })
        await req.journalist.save()
        res.status(200).send('Logout Successfuly')
    } catch (e) {
        res.status(400).send('Error: ', e)
    }
})


router.delete('/logoutAll', auth, async (req, res) => {
    try {
        req.journalist.tokens = []
        await req.journalist.save()
        res.status(200).send('All Devices Logout Successfuly')
    } catch (e) {
        res.status(400).send('Error: ', e)
    }
})

module.exports = router