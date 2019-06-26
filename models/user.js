var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is not a valid role.'
};

var userSchema = new Schema({
    name: { type: String, required: [true, "Name is mandatory."] },
    email: { type: String, unique: true, required: [true, "Email is mandatory."] },
    password: { type: String, required: [true, "Password is mandatory."] },
    img: { type: String },
    role: { type: String, required: [true], default: 'USER_ROLE', enum: validRoles }
});

userSchema.plugin(uniqueValidator, { message: 'The {PATH} must be unique.' });

module.exports = mongoose.model('users', userSchema);