const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const path = require('path');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const { whitelist } = require('validator');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public')));
// Set security http header
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limiting req fro same IP
const limitter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from your IP! Try again after an hour!',
});

app.use('/api', limitter);

// Body Parser: reading data from the body int req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against no sql injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

app.use(
  hpp({
    whitelist: [
      'price',
      'duration',
      'maxGroupSize',
      'difficulty',
      'ratingQuantity',
      'ratingAverage',
    ],
  })
);

// 1) MIDDLEWARE
// custom made middleware -- order of code matters in middleware.. if we put middleware before the route() then it won't work.. route is also a middleware
// app.use((req, res, next) => {
//     console.log("Hello from the middleware!");
//     next();
// })

app.use((req, res, next) => {
  console.log(req.cookies);
  req.requestTime = new Date().toISOString();
  next();
});

//2) ROUTE HANDLERS

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', makeTour);
// app.patch('/api/v1/tours/:id', changeTourParam);
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //     status : "Fail",
  //     message : `Can't find ${req.originalUrl} on the server`
  // })
  // const err = new Error(`Can't find ${req.originalUrl} on the server`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
