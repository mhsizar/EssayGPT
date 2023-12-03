const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Pre-save hook to hash the password
userSchema.pre('save', function(next) {
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);

            bcrypt.hash(this.password, salt, (error, hash) => {
                if (error) return next(error);
                this.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', userSchema);
