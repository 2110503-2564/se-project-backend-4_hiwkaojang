const Booking = require('../models/Booking');
const Dentist = require('../models/Dentist');

//@desc Get all booking
//@route GET /api/v1/bookings
//@access Private
exports.getBookings = async (req,res,next) => {
    let query;

    //General users can see only their booking!
    if(req.user.role !== 'admin') {
        query = Booking.find({user:req.user.id}).populate({path:'dentist',select:'name year_experience area_expertise'});
    } else {
        //If you are and admin, you can see all!
        if(req.params.dentistId) {
            console.log(req.params.dentistId);
            query = Booking.find({dentist:req.params.dentistId}).populate({path:'dentist',select:'name year_experience area_expertise'});;
        } else {
            query = Booking.find().populate({path:'dentist',select:'name year_experience area_expertise'});
        }
    }

    try {
        const bookings = await query;

        res.status(200).json({success:true, count:bookings.length, data:bookings})
    } catch(error) {
        console.log(error);
        return res.status(500).json({sucess:false, message:'Cannot find Booking'});
    }
}

//@desc Get single booking
//@route GET /api/v1/booking:id
//@access Public
exports.getBooking = async (req,res,next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'dentist',
            select: 'name year_experience area_expertise'
        });

        if(!booking) {
            return res.status(404).json({success:false, message:`No booking with the id of ${req.params.id}`});
        }

        res.status(200).json({success:true, data: booking});
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message:'Cannot find Booking'});
    }
}

//@desc Add booking
//@route POST /api/v1/bookings/:bookingId/booking
//@access Private
exports.addBooking = async (req,res,next) => {
    try {
        req.body.dentist = req.params.dentistId;

        const dentist = await Dentist.findById(req.params.dentistId);

        if(!dentist) {
            return res.status(404).json({success:false, message:`No dentist with the id of ${req.params.dentistId}`});
        }

        //add user Id to req.body
        req.body.user = req.user.id;
        // Check if user already has an upcoming booking
        const upcomingBookings = await Booking.find({ user: req.user.id, status: 'upcoming' });

        //If the user is not an admin, they can only create 1 booking.
        if(upcomingBookings.length >= 1 && req.user.role !== 'admin') {
            return res.status(400).json({success:false, message:`The user with ID ${req.user.id} has already made 1 booking`});
        }

        const booking = await Booking.create(req.body);

        res.status(200).json({success:true, data:booking});
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message:'Cannot create Booking'});
    }
}

//@desc Update booking
//@route PUT /api/v1/bookings/:id
//@access Private
exports.updateBooking = async (req,res,next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if(!booking) {
            return res.status(404).json({success:false, message:`No booking with the id of ${req.params.id}`});
        }

        //Make sure user is the booking owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to update this booking`});
        }

        booking = await Booking.findByIdAndUpdate(req.params.id,req.body, {
            new:true,
            runValidators:true
        });

        res.status(200).json({success:true, data: booking});
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message:'Cannot update Booking'});
    }
}

//@desc Delete booking
//@route DELETE /api/v1/bookings/:bookingId/booking
//@access Private
exports.deleteBooking = async (req,res,next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if(!booking) {
            return res.status(404).json({success:false, message:`No booking with the id of ${req.params.id}`});
        }
        
        //Make sure user is the booking owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to delete this booking`});
        }

        await booking.deleteOne();

        res.status(200).json({success:true, data:{}});
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message:'Cannot delete Booking'});
    }
}