//File for handling errors including development and production errors
//This is the custom error class for handling errors 


const CustomError = require("../utils/CustomError")

const devErrors = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error: error
    })
}


const castErrorHandler = (err) => {
    let msg = `Invalid value ${err.value} for field ${err.path}`
    return new CustomError(msg, 400)
}

const tokenExpiredErrorHanndler = (err) => {
    let msg = `Token has expired ,please login again`
    return new CustomError(msg, 400)
}

const handleJWTError = (err) => {
    return new CustomError('Invalid token, please login again', 401)
}


const duplicateKeyErrorHandler = (err) => {
    const name = err.keyValue.name
    let msg = `The movie with the name ${name} already exists. Please choose another name`
    return new CustomError(msg, 400)
}

const validationErrorHandler = (err) => {
    const errors = Object.values(err.errors).map(val => val.message)
    const errorMessages = errors.join('. ')
    const msg = `Invalid input data: ${errorMessages}`

    return new CustomError(msg, 400)
}


const prodErrors = (res, error) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        })    
    }else{
        res.status(500).json({
            status: 'Error',
            message: "Something went wrong, Plesse try again"
        })
    }

    
}


module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500
    error.status = error.status || "An error occured"

    if (process.env.NODE_ENV === 'development') {
        devErrors(res, error)
    }else if(process.env.NODE_ENV === 'production'){
        if (error.name === 'CastError') error = castErrorHandler(error)
        if(error.code === 11000) error = duplicateKeyErrorHandler(error)
        if(error.name === 'ValidationError') error = validationErrorHandler(error)
        if(error.name === 'TokenExpiredError') error = tokenExpiredErrorHanndler(error)
        if(error.name === 'JsonWebTokenError') error = handleJWTError(error)
        prodErrors(res, error)
    }

}

