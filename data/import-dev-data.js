//A file/script for importing json document into a mongodb server from the CLI


const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config({path: "./config.env"})
const fs = require("fs")

const Movie = require("../model/movieModel")



mongoose.connect(process.env.CONN_STR, {useNewUrlParser: true}).then(() => console.log("DB Connection is Sucessful")).catch((err) => {
    console.log(err)
})


const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'))

//delete current movies data

const deleleMovies = async () => {
    try {
        await Movie.deleteMany()
    console.log("Movie deleted successfully")
    } catch (error) {
        console.log(error.message)
    }
}

//import movies data

const importMovies = async () => {
    try {
        await Movie.create(movies)
    console.log("Movie imported successfully")
    } catch (error) {
        console.log(error.message)
    }
}


if (process.argv[2] === "--delete") {
    deleleMovies()
}else if(process.argv[2] === "--import"){
    importMovies()
}
