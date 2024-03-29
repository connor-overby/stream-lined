const mongoose = require('mongoose');


const Schema = mongoose.Schema;
const UserSchema = new Schema({
    id: Number,
    name: String,
    pfp: String,
    type: String
})

module.exports = mongoose.model('User', UserSchema);