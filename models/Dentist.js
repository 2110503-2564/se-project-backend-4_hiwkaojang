const mongoose = require('mongoose');

const DentistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
    },
    year_experience: {
        type: Number,
        required: [true, 'Please add years of experience'],
        min: [0, 'Years of experience cannot be negative']
    },
    area_expertise: {
        type: String,
        required: [true, 'Please add an area of expertise']
    },
    picture: {
        type: String,
        required: false,
    }
}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

//Reverse populate with virtuals
DentistSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'dentist',
    justOne:false
});

module.exports = mongoose.model('Dentist', DentistSchema);