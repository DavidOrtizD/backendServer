var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    name: { type: String, required: [true, 'The hospital name is mandatory.'], unique: true },
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'users' }
}, { collection: 'hospitals' });

module.exports = mongoose.model('Hospital', hospitalSchema);