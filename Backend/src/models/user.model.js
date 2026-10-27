import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [5 , 'Email must be at least 5 characters long'],
        maxLength: [50 , 'Email must be at most 50 characters long'],
    },
    password: {
        type: String,
        required: true,
        select: false
    }
})

userSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
}

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function() {
    return jwt.sign({
        id: this._id,
        email: this.email
    }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    })
}

const User = mongoose.model('user', userSchema);

export default User;