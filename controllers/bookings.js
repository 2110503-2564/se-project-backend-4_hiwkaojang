const Booking = require('../models/Booking');
const Dentist = require('../models/Dentist');
const mongoose = require('mongoose');

//@desc Get all booking
//@route GET /api/v1/bookings
//@route GET by Filter status ex. /api/v1/bookings?status=complete (Filter: status = complete ) can filter 3 status ( upcoming , completed , cancelled ) 
//@access Private
exports.getBookings = async (req,res,next) => {
    let query;

    //General users can see only their booking!
    if (req.user.role === 'dentist') {
        query = Booking.find({ dentist: req.user.dentist_id }).populate({
          path: 'dentist',
          select: 'name year_experience area_expertise',
        });
      } else if(req.user.role !== 'admin') {
        query = Booking.find({ user: req.user.id }).populate({
          path: 'dentist',
          select: 'name year_experience area_expertise',
        });
      } else {
        //If you are and admin, you can see all!
        if(req.params.dentistId) {
            console.log(req.params.dentistId);
            query = Booking.find({dentist:req.params.dentistId}).populate({path:'dentist',select:'name year_experience area_expertise'});;
        } else {
            query = Booking.find().populate({path:'dentist',select:'name year_experience area_expertise'});
        }
    }

    // Add status filtering
    if (req.query.status) {
        query = query.where('status').equals(req.query.status);
    }

    try {
        const bookings = await query;

        res.status(200).json({success:true, count:bookings.length, data:bookings})
    } catch(error) {
        console.log(error);
        return res.status(500).json({sucess:false, message:'Cannot find Booking'});
    }
}

//@desc Get booking history by patient (user) ID
//@route GET /api/v1/bookings/patientHistory/:userId
//@access Private (admin or the user themselves)
exports.getPatientHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Only allow if user is admin or accessing their own data
        if (req.user.role !== 'dentist' && req.user.id !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this patient history' });
        }

        const bookings = await Booking.find({ user: userId })
            .populate({
                path: 'dentist',
                select: 'name year_experience area_expertise',
            });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot retrieve patient history',
        });
    }
};


//@desc Get single booking
//@route GET /api/v1/booking:id
//@access Public
exports.getBooking = async (req,res,next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'dentist',
            select: 'name year_experience area_expertise'
        })
        .populate({
            path: 'user',
            select: 'name email' // or other fields you want to return
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

exports.addBooking = async (req, res, next) => {
    try {
        req.body.dentist = req.params.dentistId;

        const dentist = await Dentist.findById(req.params.dentistId);

        if (!dentist) {
            return res.status(404).json({
                success: false,
                message: `No dentist with the id of ${req.params.dentistId}`
            });
        }

        // Add user ID to req.body
        req.body.user = req.user.id;

        // Check if user already has an upcoming booking
        const upcomingBookings = await Booking.find({ user: req.user.id, status: 'upcoming' });

        // Allow multiple bookings for 'admin' and 'dentist', limit regular users
        if (upcomingBookings.length >= 1 && !['admin', 'dentist'].includes(req.user.role)) {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 1 booking`
            });
        }

        const booking = await Booking.create(req.body);

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot create Booking'
        });
    }
}

//@desc Update booking
//@route PUT /api/v1/bookings/:id
//@access Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        // Allow only: booking owner (user), assigned dentist, or admin
        const isUserOwner = booking.user.toString() === req.user.id;
        const isDentistOwner = req.user.role === 'dentist' && booking.dentist.toString() === req.user.dentist_id?.toString(); // use .dentist_id as per your structure
        const isAdmin = req.user.role === 'admin';

        if (!isUserOwner && !isDentistOwner && !isAdmin) {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this booking`
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot update Booking'
        });
    }
};


//@desc Delete booking
//@route DELETE /api/v1/bookings/:bookingId/booking
//@access Private
exports.deleteBooking = async (req,res,next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if(!booking) {
            return res.status(404).json({success:false, message:`No booking with the id of ${req.params.id}`});
        }
        
        //Make sure user is the admin
        if( req.user.role !== 'admin') {
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to delete this booking`});
        }

        await booking.deleteOne();

        res.status(200).json({success:true, data:{}});
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message:'Cannot delete Booking'});
    }
}