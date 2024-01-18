class CustomError extends Error{
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode
        this.status = statusCode >= 400 && statusCode < 500 ? "Failed" : "Error from server"

        this.isOPerational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = CustomError