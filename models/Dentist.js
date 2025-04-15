const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema(
  {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const AvailabilityDateSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    slots: [TimeSlotSchema],
  },
  { _id: false }
);

const DentistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
    },
    year_experience: {
      type: Number,
      required: [true, "Please add years of experience"],
      min: [0, "Years of experience cannot be negative"],
    },
    area_expertise: {
      type: String,
      required: [true, "Please add an area of expertise"],
    },
    picture: {
      type: String,
      required: false,
    },
    //Add StartingPrice field to store starting price of dentist
    StartingPrice: {
      type: Number,
      required: [true, "Please add a starting price"],
      min: [0, "Starting price cannot be negative"],
    },
    //Add Rating field to store rating value for US1-1
    Rating: {
      type: Number,
      required: false,
    },
    //Add avialbility calendar
    availability: [AvailabilityDateSchema],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Reverse populate with virtuals
DentistSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "dentist",
  justOne: false,
});

module.exports = mongoose.model("Dentist", DentistSchema);
