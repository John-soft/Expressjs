const express = require('express')
const movieControllers = require("../controllers/moviesController")
const authController = require('../controllers/authController')


//ROUTE = HTTP METHOD + URL
//Route Chaining
const router = express.Router()

router.route('/highest-rated')
    .get(movieControllers.getHighestRated,movieControllers.getAllMovies)

router.route('/movie-stats')
    .get(movieControllers.getMovieStats) 

router.route('/movies-by-genre/:genre')
    .get(movieControllers.getMovieByGenre) 

router.route('/')
    .get(authController.protect,movieControllers.getAllMovies)
    .post(movieControllers.createMovie)

router.route('/:id')
    .get(movieControllers.getMovie)
    .patch(movieControllers.updateMovie)
    .delete(authController.protect, authController.restrict('admin') ,movieControllers.deleteMovie)

    module.exports = router