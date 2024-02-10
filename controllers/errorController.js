const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/'(["'])(?:(?=(\\?))\2.)*?\1'/)[0];
  console.log(value);
  const message = `Duplicate fields value ${value}: please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const error = Object.values(err.error).map((el) => el.message);
  const message = `Invalid input data. ${error.join(', ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid token! Please login again', 401);

const handleJWTExpireError = (err) =>
  new AppError('Your token has expired! please login again.', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.log('ERROR!!!!!!', err);
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // operational error : trusted error : sent to the client
  console.log('hiii', err.isOperational);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programing error should be not get leaked to the client
    // 1) logging
    console.log('ERROR!!', err);
    // 2) sending generic response
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

// module.exports = (err, req, res, next) => {
//   // console.log(err.stack);
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   if (process.env.NODE_ENV === 'development') {
//     sendErrorDev(err, req, res);
//     console.log('hiiiiiiiis', process.env.NODE_ENV);
//   } else {
//     console.log('bye', process.env.NODE_ENV);

//     let error = { ...err };

//     if (error.name === 'CastError') error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//     if (error.name === 'ValidationErrorv')
//       error = handleValidationErrorDB(error);
//     if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
//     if (error.name === 'TokenExpiredError') error = handleJWTExpireError(error);

//     sendErrorProd(error, req, res);
//   }

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// };
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpireError(error);

    sendErrorProd(error, req, res);
  }
};
