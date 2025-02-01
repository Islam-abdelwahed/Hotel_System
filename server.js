require("dotenv").config();
const express = require("express");
const winston = require("winston");
// const session = require("express-session");
const { v4 } = require("uuid");
// const MongoDbStore = require("connect-mongodb-session")(session);
const app = express();
const nodemailer = require("nodemailer");
// Routes
const EmplyeeRoutes = require("./routes/employeeRoutes");
const RoomRoutes = require("./routes/roomsRoutes");
const AuthRoutes = require("./routes/authRoutes");
const BookingRoutes = require("./routes/reservationRoutes");
const ServiceRoutes = require("./routes/serviceRoutes");
// DataBases
const mongoose = require("mongoose");
// Utils
const cookieParser = require("cookie-parser");
// const multer = require("multer");


// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, v4() + "-" + file.originalname);
//   },
// });

// const file_Filter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const store = new MongoDbStore({
//   uri: process.env.DATABASE_URI,
//   collection: "sessions",
// });

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://your-frontend-domain.com"); // Allow specific domain
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Allowed methods
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization" // Allow Authorization header
  );
  next();
});

// app.use(
//   multer({ storage: multerStorage, fileFilter: file_Filter }).single("image")
// );
app.use((req, res, next) => {
  req.transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "islamabdelwahed61@gmail.com",
      pass: "kijjvszyfaxtfkrn",
    },
  });
  next();
});
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", AuthRoutes);
app.use("/rooms", RoomRoutes);
app.use("/reservation", BookingRoutes);
app.use("/employees", EmplyeeRoutes);
app.use("/services", ServiceRoutes);

app.use((req, res) => {
  res.send("<h1>404.. page not found</h1>");
});

app.use((err, req, res, next) => {
  res.status(err.statusCode).json({ msg: err.message });
});

mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => {
    app.listen(process.env.PORT, (req, res) => {
      console.log(`server is listen to port:${process.env.PORT}`);
      console.log(`http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: "combined.log" }),
//   ],
// });
// // Async logging
// async function logAsync() {
//   logger.info("This is an info log");
//   logger.error("This is an error log");
// }

// logAsync();
