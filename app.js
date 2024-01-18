const express = require('express')
const morgan = require('morgan')
const moviesRouter = require('./routes/moviesRoutes')
const authRouter = require('./routes/authRouter')
const CustomError = require('./utils/CustomError')
const globalErrorHandler = require('./controllers/errorcontroller')
let app = express()
const userRoute = require('./routes/userRoute')

//Custom middleware
//middleware always receive three arguments (req,res,next) ----- the enxt passes the control to the next middleware 
//middleware runs on all the functions or other middlewares in the program
const requestMiddleware = function(req, res, next){
    req.requestedAt = new Date().toISOString()
    next()
}

app.use(morgan('dev'))
//Middleware
app.use(express.json())
app.use(express.static('./public'))
app.use(requestMiddleware)

app.use('/api/v1/movies', moviesRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRoute)
//creating default route ---- gets executed when a user enters a route that is not defined
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'Failed',
    //     message: `Can't find ${req.originalUrl} on the server`
    // })
    // const err = new Error(`Can't find ${req.originalUrl} on the server`)
    // err.status = "Failed",
    // err.statusCode = 404

    const err = new CustomError(`Can't find ${req.originalUrl} on the server`, 404)
    next(err)
})

///Handling global errors ----creating error middleware
app.use(globalErrorHandler)

module.exports = app;