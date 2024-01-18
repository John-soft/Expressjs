const User = require('../model/userModel')
const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');
const util = require('util')
const sendEmail = require('./../utils/email')
const crypto = require('crypto');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

const createSendResponse = (user, statusCode, res) => {
    const token = signToken(newUser._id)

        res.status(statusCode).json({
            status: 'Success',
            token,
            data: {
                user
            }
        })
}

const signup = async(req, res, next) => {
    try {
        const newUser = await User.create(req.body);
        createSendResponse(newUser, 201, res)
    } catch (error) {
        res.status(400).json({
            status: 'Failed',
            message: `Error: ${error.message}`
        })
    }
}

const login = async (req, res, next) => {
    try {
        const {email, password} = req.body
        // const email = req.body.email
        // const password = req.body.password

       //check if email and password exist in the request body 
        if (!email || !password) {
        const error = new CustomError('Please provide the email and password to login', 400)
        return next(error)
    }

    //check if user with the given email exists 
    const user = await User.findOne({email}).select('+password')
    //const isMatch = await user.comparePassword(password, user.password)

    if (!user || !(await user.comparePassword(password, user.password))) {
        const error = new CustomError('Incorrect email or password', 400)
        return next(error)
    }

    createSendResponse(user, 200, res)

    } catch (error) {
        res.status(400).json({
            status: 'Failed',
            message: 'Error occured,try again'
        })
    }
}


const protect = async (req, res, next) => {
    try {
    //1. Read the token & check if it exists
    const testToken = req.headers.authorization
    let token
    if (testToken && testToken.startsWith('Bearer')) {
        token = testToken.split(' ')[1]
    }
    if (!token) {
        const error = new CustomError('You are not logged in', 404)
        next(error)
    }
    //2. Validate the token
    const decodedToken = util.promisify(jwt.verify)(token, process.env.SECRET_STR)
    //3. check if the user exists in the db
    const user = User.findById(decodedToken.id)

    if (!user) {
        const error = new CustomError('The user with the given token does not exist')
        next(error)
    }

    //4. If the user changed password after the token was issued
    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
    if (isPasswordChanged) {
        const error = new CustomError('Password changed, please login again!')
        next(error)
    }
    //5. Allow user to access the route
    req.user = user
    next()    
    } catch (error) {
        
    }
}

const restrict = (role) => {
    return (req, res, next) => {
        try {
            if (req.user.role !== role) {
                const error = new CustomError('You do not have permission to perform this action', 403)
                next(error)
            }
            next()
        } catch (error) {
            
        }
    }
}

//In case of multiple roles to perform an action
/*const restrict = (role) => {
    return (req, res, next) => {
        try {
            if (!req.user.role !== role) {
                const error = new CustomError('You do not have permission to perform this action', 403)
                next(error)
            }
            next()
        } catch (error) {
            
        }
    }
}*/



const forgotPassword = async (req, res, next) => {
    //1. GET USER BASED ON POSTED MAIL
    try {
    const user = await User.findOne({email: req.body.email})
    if (!user) {
        const error = new CustomError('We could not find the user with the given email', 404)
        next(error)
    }

     //2. GENERATE A RANDOM RESET TOKEN  
     const resetToken = user.createResetPasswordToken()
     await user.save({validateBeforeSave: false})

      //3. SEND THE TOKEN BACK TO THE USER EMAIL
      const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
      const message = `We have received a password reset request. Plesse click on the link below to reset your password\n\n${resetUrl}\n\nThis reset password link will only be valid for 10 minnutes`
      try {
        await sendEmail({
            email: user.email,
            subject: 'Password change request received',
            message: message
          })

          res.status(200).json({
            status: "Success",
            message: 'Password reset link sent to the user email' 
          })
          
      } catch (error) { 
        user.passwordResetToken = undefined
        user.passwordResetTokenExpires = undefined
        user.save({validateBeforeSave: false})

        return next(new CustomError('There was an error sending password reset link. Please try again', 500))
      }
    } catch (error) {
        res.status(400).json(
            {
                status: 'Failed',
                message: 'Falied to send password reset link'
            }
        )
    }
   
}

const resetPassword = async (req, res, next) => {
    try {

        //1. CHECK IF THE GIVEN USER EXISTS WITH THE TOKEN & THE TOKEN HAS NOT EXPIRED
        const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
        const user = User.findOne({passwordResetToken: token, passwordResetTokenExpires: {$gt: Date.now()}})
        if (!user) {
            const error = new CustomError('Token is invalid or has expired', 400)
            next(error)
        }

        //2. RESETTING THE USER PASSWORD
        user.password = req.body.password
        user.confirmPassword = req.body.confirmPassword

        user.passwordResetToken = undefined
        user.passwordResetTokenExpires = undefined
        user.passwordChangedAt = Date.now()

        user.save()

        //3. LOGIN THE USER
        createSendResponse(user, 200, res)


    } catch (error) {
        res.status(400).json({
            status: 'Failed',
            message: "Error"
        })
    }
}



module.exports = {
    signup,
    login,
    protect,
    restrict,
    forgotPassword,
    resetPassword,
    
}