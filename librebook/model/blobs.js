var mongoose = require('mongoose')

var bookSchema = new mongoose.Schema({
    title: String,
    qty: Number
})

var blobSchema = new mongoose.Schema({
    name: String,
    badge: Number,
    dob: {
        type: Date,
        default: Date.now
    },
    isLoved: Boolean
})


mongoose.model('Blob', blobSchema);
mongoose.model('Book', bookSchema);
