const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   }
// })

// exports.uploadPhoto = multer({ dest: 'public/img/users' });

const filerObj = (obj, ...allAllowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allAllowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) check if user tries to update password
  console.log(req.file);
  console.log(req.body);
  if (req.body.password || req.body.updatePassword) {
    return next(
      new AppError(
        'The route is not for changing the password. You should use /updatePassword route',
        400
      )
    );
  }

  // 2) fillterd out unwated fields that are not allowed to updated
  const filteredBody = filerObj(req.body, 'name', 'email');

  // 3) updated user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'Success',
    // requestedAt : req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined!',
  });
};

exports.getUser = factory.getOne('User');

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not defined!',
//   });
// };

exports.chageUserParam = factory.updateOne(User); // not password

exports.deleteUser = factory.deleteOne(User);
