const {Schema, model } = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs') 
const crypto = require('crypto')
//name, email, photo, password, confrim password

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        lowercase: true,
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String, 
        required: [true, 'Please confirm your password'],
        validate: {
            //validatos only work on save() & create() method
            validator: function(val){
                return val == this.password
            },
            message: "Passwords do not match!"
        }
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date
})

userSchema.pre('save', function(next){
    if (!this.isModified('password')) return next()

    //encrypts the password before saving it
    this.password = bcrypt.hash(this.password, 12)

    //this line does not save the confirmpassword to the database
    this.confirmPassword = undefined
    next()
})


//mongoose method to comapre the password that the user provides and the oee in the database
userSchema.methods.comparePassword = async function(pswd, pswdDB){
    return await bcrypt.compare(pswd, pswdDB)
}

userSchema.methods.isPasswordChanged = async function(JWTTimestamp){
    if (this.passwordChangedAt) {
        const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < pswdChangedTimestamp
    }
    return false
}


userSchema.methods.createResetPasswordToken = async function(){
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //currentDate + 10mins * 60s * 1000ms 
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000

    console.log(resetToken, this.passwordResetToken)

    return resetToken

}

const User = model('User', userSchema)

module.exports = User

