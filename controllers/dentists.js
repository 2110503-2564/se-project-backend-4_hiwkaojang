const Dentist = require('../models/Dentist');
const Booking = require('../models/Booking');

//@desc Get all dentists
//@route GET /api/v1/dentists
//@access Public
exports.getDentists = async (req, res, next) => {
    let query;

    //Copy req.query
    const reqQuery = { ...req.query };

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Dentist.find(JSON.parse(queryStr)).populate('bookings');

    //Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        const total = await Dentist.countDocuments();
        query = query.skip(startIndex).limit(limit);

        //Execute query
        const dentists = await query;

        //Pagination result
        const pagination = {};

        if(endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({ sucess: true, count: dentists.length, pagination, data: dentists });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};

//@desc Get single dentist
//@route GET /api/v1/dentist/:id
//@access Public
exports.getDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id);

        if (!dentist) {
            return res.status(400).json({ sucess: false });
        }

        res.status(200).json({ sucess: true, data: dentist });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};

//@desc Create a dentist
//@route POST /api/v1/dentists
//@access Private
exports.createDentist = async (req, res, next) => {
    const dentist = await Dentist.create(req.body);
    res.status(201).json({ sucess: true, data: dentist });
};

//@desc Update single dentist
//@route PUT /api/v1/dentist/:id
//@access Private
exports.updateDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!dentist) {
            return res.status(400).json({ sucess: false });
        }

        res.status(200).json({ sucess: true, data: dentist });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};

//@desc Update single dentist's review
//@route PUT /api/v1/dentist/review/:id
//@access Private
exports.updateDentistReview = async (req, res, next) => {
    try {

        const reviewToPush = {
            rating : {
            user : req.user.id,
            rating : req.body.rating,
            review : req.body.review
            }
        }

        const reviewToPull = {
            rating : {
                user : req.user.id,
            }
        }


        //Remove any existing reviews by this user
        await Dentist.findByIdAndUpdate(req.params.id , {$pull : reviewToPull});

        //Add a review for this user
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, { $push : reviewToPush }, {
            new: true,
            runValidators: true
        });

        //Effectively makes this both an update and create function
        if (!dentist) {
            return res.status(400).json({ sucess: false });
        }

        res.status(200).json({ sucess: true, data: dentist });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};

//@desc Remove single dentist's review(s)
//@route PUT /api/v1/dentist/review/:id
//@access Private
exports.removeDentistReview = async (req, res, next) => {
    try {

        const reviewToPull = {
            rating : {
                user : req.user.id,
            }
        }

        //PULL(remove) this dentist's review(s) matching user's id
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, { $pull : reviewToPull }, {
            new: true,
            runValidators: true
        });

        if (!dentist) {
            return res.status(400).json({ sucess: false });
        }

        res.status(200).json({ sucess: true, data: dentist });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};

//@desc Delete single dentist
//@route DELETE /api/v1/dentist/:id
//@access Private
exports.deleteDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id);

        if (!dentist) {
            return res.status(400).json({ sucess: false });
        }

        await Booking.deleteMany({dentist:req.params.id});
        await Dentist.deleteOne({_id:req.params.id});

        res.status(200).json({ sucess: true, data: {} });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};