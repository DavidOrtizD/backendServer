var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var medicSchema = new Schema({
    name: { type: String, required: [true, 'The name is mandatory.'] },
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'Hospital ID is mandatory.'] }
}, { collection: 'medics' });

module.exports = mongoose.model('Medic', medicSchema);