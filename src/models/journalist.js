const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const Journalist = mongoose.model('Journalist', journalistSchema)


const journalistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 4
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    phone: {
        type: Number,
        required: true,
        trim: true,
        minlength: 11,
        validate(value) {
            if (!validator.isNumeric(value.toString(), 'ar-EG')) {
                throw new Error("Phone Nummber is invalid")
            }
        }

    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
})

journalistSchema.pre('save', async function (next) {
    const journalist = this
    if (journalist.isModified('password')) {
        journalist.password = await bcrypt.hash(journalist.password, 8)
    }
    next()
})



journalistSchema.static.findByCredentials = async (email, password) => {
    const journalist = await Journalist.findOne({
        email
    })
    if (!journalist) {
        throw new Error('Can not login, Wrong Email or Password')
    }
    const isMatch = await bcrypt.compare(password, journalist.password)
    if (!isMatch) {
        throw new Error('can not login, Wrong Email or Password')
    }
    return journalist
}



journalistSchema.methods.generateToken = async function () {
    const journalist = this
    const token = JWT.sign({
        _is: journalist._id.toString()
    }, 'NodeJournalistAPI', {
        expiresIn: '7 days'
    })
    journalist.tokens = journalist.tokens.concat({
        token
    })

    await journalist.save()

    return token
}


journalistSchema.virtual('news', {
    ref: 'News',
    localField: '_id',
    foreignField: 'owner'
})



module.exports = Journalist