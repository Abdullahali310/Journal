const mongoose = require('mongoose')
const News = mongoose.model('News', {
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

module.exports = News