const Tour = require('../models/tourModel');
const { populate } = require('../models/tourModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with this ID', 404));
    }
    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with this ID', 404));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        // tour : tour
        data: doc,
      },
    });
    // } catch (error) {
    //     res.status(400).json({
    //         status : "fail",
    //         message : error
    //     })
    // }
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log(req.body);

    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'Success',
      data: {
        doc: newDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with this ID', 404));
    }
    // Tour.findOne({_id : req.params.id})

    // if(id > tours.length-1)
    res.status(200).json({
      status: 'Success',
      data: {
        doc,
      },
    });
    // } catch (error) {
    //     res.status(404).json({
    //         status: 'fail',
    //         message : error
    //     })
    // }
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // try {
    // execte query
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'Success',
      // requestedAt : req.requestTime,
      results: doc.length,
      data: {
        doc,
      },
    });

    // } catch (error) {
    //     res.status(404).json({
    //         status: 'fail',
    //         message : error.message
    //     })
    // }
  });
