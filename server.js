const dotenv = require('dotenv');
dotenv.config({ path : './config.env' });

const app = require('./app');
const mongoose = require('mongoose');



// const mongo = mongoose
//   .connect(
//     process.env.DATABASE
//   )
//   .then(() => {
//     console.log("connected");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to MongoDB");
    
    // Start the Express app after successful database connection
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`App is listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.log("UNHANDLED REJECTIONS !! Shutting down");
//   console.log(err);
//   server.close(() => {
//     process.exit(1);
//   });
// });
// process.on('uncaughtException', (err) => {
//   console.log("UNCAUGHT EXCEPTION !! Shutting down");
//   console.log(err);
//   server.close(() => {
//     process.exit(1);
//   });
// });
// console.log(x);




// const DB = process.env.DATABASE.replace(
//     '<PASSWORD>', 
//     process.env.DATABASE_PASSWORD);

// mongoose.connect(DB ,{
//     useNewUrlParser : true,
//     useCreateIndex : true,
//     useFindAndModify : false
// }).then(con => {
//     console.log(con.connection);
//     console.log('DB connected successfully')})

// const connectDb = async () => {
//     try {
//       const dbUrl = "mongodb+srv://darshchangawala:<password>@cluster0.aolfgfp.mongodb.net/natours?retryWrites=true&w=majority";
//       await mongoose.connect(dbUrl);
//       logger.info(`MongoDB Connected`, { url: dbUrl });
//     } catch (error) {
//       logger.error(`MongoDB connection error: ${error}`);
//     }
//   };
// const connectDb = async () => {
//     try {
//       const dbUrl = `mongodb+srv://darshchangawala:${encodeURIComponent('<password>')}@cluster0.aolfgfp.mongodb.net/?retryWrites=true&w=majority`;
//       await mongoose.connect(dbUrl, {
//         useNewUrlParser: true,
//         useCreateIndex: true,
//         useFindAndModify: false,
//         useUnifiedTopology: true
//       });
//       console.log(`MongoDB Connected`);
//     } catch (error) {
//       console.error(`MongoDB connection error: ${error}`);
//     }
//   };

//   (async () => {
//     const isConnected = await connectDb();
  
//     if (isConnected) {
//       console.log("DB connected");
//     } else {
//       console.log("DB connection failed");
//     }
  
//     // Additional code can go here
//   })();
    // console.log(process.env);
// const port = process.env.PORT || 3000;

// app.listen(port, () =>{
//     console.log(`App is listening to port ${port}`);
// })

// process.on("UnhandledRejection", (err) => {
//   console.log(err.name. err.message);
//   console.log("Shutting down");
//   process.exit(1);
// })