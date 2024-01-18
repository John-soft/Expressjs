const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const app = require('./app')


mongoose.connect(process.env.CONN_STR, {useNewUrlParser: true})
    .then((conn) => {
        // console.log(conn)
        console.log("DB Connection Successful")
}).catch((error) => {
    console.log(`Error: ${error}`)
})

//CREATE A SERVER
const port = process.env.PORT || 6000
app.listen(port, () => {
    console.log("Server is up and running ..........")
})

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message)
    process.exit(1)
})
 