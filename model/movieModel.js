const fs = require("fs")
const { Schema, model } = require("mongoose")
const validator = require('validator')

const movieSchema = new Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        //Built-in validators
        required: [true, "Name is required field!"],
        maxlength: [100, "Movie name must have more than 100 characters"],
        minlength: [4, "Movie name must have at least 4 characters"],
        //External validator --- third party
        //validate: [validator.isAlpha, "Name should contain only alphabets"]

    }, 
    description: {
        type: String,
        required: [true, "Description is required field!"],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, "Duration is required field!"],
    },
    ratings: {
        type: Number,
        validate: {
            validator: function(value){
                return value >= 1 && value <= 10 
            },
            message: "Ratings ({VALUE}) should be above 1 and below 10"
        },
    },
    totalRatings: {
        type: Number
    },
    releaseYear:{
        type: Number,
        required: [true, "Release Year is required field"]
    },
    releaseDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    createdBy: {
        type: String
    },
    genres: {
        type: [String],
        // enum: { 
        //     values: ["Action", "Thriller", "Comedy" ,"Adveture", "Sci-Fi", "Crime", "Drama", "Romance", "Biography",],
        //     message: "This genre does not exist",
        // },
        required: [true, "Genres field is required field"]
    },
    directors: {
        type: [String],
        required: [true, "Directors field is required field"]
    },
    coverImage:{
        type: String,
        required: [true, "Cover Image is a required field"]
    },
    actors: {
        type: [String],
        required: [true, "Actors field is required"]
    },
    price: {
        type: Number,
        required: [true, "Price field is required"]
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}
)

movieSchema.virtual('durationInHours').get(function(){
    return this.duration / 60
})


//EXECUTED BEFORE THE DATABASE IS SAVED TO THE DB
//Performed on .save or .create method
movieSchema.pre('save', function(next){
    this.createdBy = "Father John"
    next()
})

//LOGIC TO BE EXCEUTED AFTER SAVING A DOCUMENT IN THE DB
movieSchema.post('save', function(doc, next){
    let content = `A new movie document with the name ${doc.name} has been created by ${doc.createdBy}\n`
    fs.writeFileSync('./log/log.txt', content, {flag: 'a'}, (err) => {
        console.log(err.message)
    })
    next()
})

movieSchema.pre(/^find/, function(next){
    this.find({releaseDate: {$lte: Date.now()}})
    this.startTime = Date.now()
    next()
})

movieSchema.post(/^find/, function(next){
    this.find({releaseDate: {$lte: Date.now()}})
    this.endTime = Date.now()
    const content = `This query took ${this.endTime - this.startTime} milliseconds to run the program\n`
    fs.writeFileSync('./log/log.txt', content, {flag: 'a'}, (err) => {
        console.log(err.message)
    })
    next()
})


const Movie = model("Movie", movieSchema)

module.exports = Movie