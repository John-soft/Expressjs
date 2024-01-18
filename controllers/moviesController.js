
const Movie = require('../model/movieModel')
const ApiFeatures = require('../utils/ApiFeatures')
const CustomError = require('../utils/CustomError')
const asyncErrorHandler = require('../utils/asyncErrorHandler')

//ROUTE HANDLER FUNCTIONS
const getHighestRated = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratings'
    next()
}

const getAllMovies = asyncErrorHandler( async (req, res, next) => {
        const features = new ApiFeatures(Movie.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()

        let movies = await features.query

        res.status(200).json({
            status:"Success",
            length: movies.length,
            data: {
                movies
            }
        })
})

const getMovie = asyncErrorHandler( async(req, res, next) => {  
        const movie = await Movie.findById(req.params.id) 

        //Handling 404 errors
        if (!movie) {
            const error = new CustomError("Movie with the ID is not found", 404)
            return next(error)
        }

        res.status(200).json({
            status: "Success",
            data: {
                movie
            }
        })
})


const createMovie = asyncErrorHandler (async (req, res, next) => {
    const movie = await Movie.create(req.body)
    res.status(201).json({
        status: "Success",
        data: {
            movie
        }
    })
})

const updateMovie = asyncErrorHandler( async (req, res, next) => {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})


    //Handling Not Found ---- 404 error
    if (!updatedMovie) {
        const error = new CustomError("Movie with the ID is not found", 404)
        return next(error)
    }
    res.status(200).json({
        status: "Success",
        data: {
            movie: updatedMovie
        }
    })
})

const deleteMovie = asyncErrorHandler( async (req, res, next) => {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id)

    //Handling Not Found ---- 404 error
    if (!deletedMovie) {
        const error = new CustomError("Movie with the ID is not found", 404)
        return next(error)
    }
    res.status(204).json({
        status: "Success",
        data: null
    })
})

const getMovieStats = asyncErrorHandler( async (req,res, next) => {
        let stats = await Movie.aggregate([
            {$match : {ratings : {$gte: 4.5}}},
            {$group: {
                _id: '$releaseYear',
                avgRating: {'$avg' : '$ratings'},
                avgPrice: {'$avg' : '$price'},
                minPrice: {'$min' : '$price'},
                maxPrice: {'$max' : '$price'},
                priceTotal: {'$sum' : '$price'},
                moviesCount: {'$sum' : 1},

            }},
            {$sort: {minPrice: 1}},
            //{$match : {maxPrice : {$gte: 60}}}
        ])

        res.status(200).json({
            status: "Success",
            count: stats.length,
            data: {
                stats
            }
        })
})

const getMovieByGenre = asyncErrorHandler( async(req, res, next) => {
        const genre = req.params.genre
        const movies = await Movie.aggregate([
            {$unwind : '$genre'},//it destructures the documents based on the passed id
            {$group: {
                _id: '$genres',
                movieCount: {'$sum' : 1},
                movies: {'$push': '$name'}
            }},
            {$addFields: {genre: '$_id'}},
            {$project: {_id: 0}},//whe passed 0 it removes the field from the documents and when passed 1 it adds the field to the document
            {$sort: {movieCount: -1}},
            //{$limit: 6}
            {$match: {genre: genre}}
        ])


        res.status(200).json({
            status: "Success",
            count: movies.length,
            data: {
                movies
            }
        })
   
})


module.exports = {
    getAllMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie,
    getHighestRated,
    getMovieStats,
    getMovieByGenre
}