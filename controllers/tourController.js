const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils//appError');
const factory = require('./handlerFactory');

exports.alisTopTours = (req, res, next) => {
  (req.query.limit = '5'),
    (req.query.sort = '-ratingAverage,price'),
    (req.query.fields = 'name,price,ratingAverage,summary,difficulty');
  next();
};

// exports.checkID = (req, res, next, val) => {
//     if(req.params.id * 1 > tours.length-1)
//     {
//         console.log(`the id is ${val}`);
//         return res.status(404).json({
//             status : "Failure",
//             message : "Invalid ID"
//         })
//     }
//     next();
// };

// exports.checkBody = (req, res, next) => {
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status : "Failure",
//             message : "Missing name or price"
//         })
//     }
//     next();
// };

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // console.log(req.params);

//   // const id = req.params.id * 1;
//   // const tour = tours.find(ele => ele.id === id);
//   // try {
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(new appError('No tour found with this ID', 404));
//   }
//   // Tour.findOne({_id : req.params.id})

//   // if(id > tours.length-1)
//   res.status(200).json({
//     status: 'Success',
//     data: {
//       tour,
//     },
//   });
//   // } catch (error) {
//   //     res.status(404).json({
//   //         status: 'fail',
//   //         message : error
//   //     })
//   // }
// });

exports.makeTour = factory.createOne(Tour);

// exports.makeTour = catchAsync(async (req, res, next) => {
//   // console.log(req.body);

//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'Success',
//     data: {
//       tours: newTour,
//     },
//   });
//   // try {
//   //     const newTour = await Tour.create(req.body);

//   //     res.status(201).json({
//   //         status : "Success",
//   //         data :{
//   //             tours : newTour
//   //         }
//   //     });

//   // } catch (error) {
//   //     res.status(400).json({
//   //         status : "fail",
//   //         message : error
//   //     })
//   // }
//   // const newTour  = new Tour();
//   // newTour.save();
// });

exports.changeTourParam = factory.updateOne(Tour);

// exports.changeTourParam = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new appError('No tour found with this ID', 404));
//   }
//   res.status(200).json({
//     status: 'Success',
//     data: {
//       // tour : tour
//       tour,
//     },
//   });
// } catch (error) {
//     res.status(400).json({
//         status : "fail",
//         message : error
//     })
// }
// });

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new appError('No tour found with this ID', 404));
//   }
//   res.status(204).json({
//     status: 'Success',
//     data: null,
//   });
//   // } catch (error) {
//   //     res.status(400).json({
//   //         status : "fail",
//   //         message : error
//   //     })
//   // }
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(201).json({
    status: 'Success',
    data: {
      stats,
    },
  });

  // } catch (error) {
  //     res.status(404).json({
  //         status : "fail",
  //         message : error
  //     })
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;

  const plans = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(201).json({
    status: 'Success',
    data: {
      plans,
    },
  });
  // } catch (error) {
  //     res.status(404).json({
  //         status : "fail",
  //         message : error
  //     })
  // }
});
// '/tours-within/:distance/center/:latlng/unit/:unit',
// tourController.getToursWithin
// );
// /tours-within/233/center/-40,45/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(new AppError('Please provide location in lat & lng', 400));
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please provide location in lat & lng', 400));
  }
  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      data: distance,
    },
  });
});
