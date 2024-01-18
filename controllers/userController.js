const User = require('../model/userModel')
const CustomError = require('../utils/CustomError');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const authController = require('./authController')

const getAllUsers = asyncErrorHandler(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        status: "Success",
        length: users.length,
        data: {
            users
        }
    })
})

const filterReqObj = (obj, ...allowedFields) =>{
    const newObj = {}
    Object.keys(obj).forEach((prop) => {
        if(allowedFields.includes(prop)){
            newObj[prop] = obj[prop]
        }
        return newObj
    })
}

const updatePassword = asyncErrorHandler( async (req, res, next) => {
    //1. GET CURRENT USER DATA FROM THE DATABASE
    const user = await User.findById(req.user._id).select('+password')
    //2. CHECK IF THE CURRENT SUPPLIED PASDWORD IS CORRECT
    if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
        return next(new CustomError('The current password you provided is wrong, please try again', 401))
    }
    //3. IF THE SUPPLIED PASSWORD IS CORRECT, UPDATE USER PASSWORD WITH THE NEW VALUE
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword

    await user.save()
    //4. LOGIN USER & SEND JWT
    authController.createSendResponse(user, 200, res)
})

const updateDetails = asyncErrorHandler(async (req, res, next) => {
    //1. CHECK IF REQUEST DATA CONTAINS PASSWORD | CONFIRMPASSWORD
    if (req.body.password || req.body.confirmPassword) {
        return next(new CustomError('Ypu cannot update your password using this endpoint', 400))
    }

    //2. UPDATE USER DETAILS
    const filterObj = filterReqObj(req.body, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj, {runValidators: true, new: true})

    res.status(201).json({
        status: 'Success', 
        data:{
            user: updatedUser
        }
    })

})

const deleteDetails = asyncErrorHandler( async (req,res,next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false})///req.user._id
    
    res.status(204).json({
        status: 'Failed',
        data: null
    })
})

module.exports = {
    updatePassword,
    updateDetails,
    deleteDetails,
    getAllUsers
}