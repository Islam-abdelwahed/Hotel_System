require("dotenv").config();
// const stripe = require("stripe")(process.env.SECRET_KEY);
// exports.stripe = stripe;
// const mongoose = require("mongoose");
// const BillModel = require("../models/bill");
const ServiceModel = require("../models/service");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Queue = require("bull");
const reservationQueue = new Queue(
  "reservationExpiration",
  process.env.REDIS_URL
);
const RESERVATION_EXPIRATION_TIME = 5 * 60 * 1000; // 30 minutes

const RoomModel = require("../models/room");
const BillModel = require("../models/bill");
const UserModel = require("../models/user");
const PaymentModel = require("../models/payment");
const ReservationModel = require("../models/reservation");

/**
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getReservations = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let Reservations;
    if (role === "admin" || role === "reciption") {
      Reservations = await ReservationModel.find();
    } else if (role === "guest") {
      Reservations = await ReservationModel.find({ userId: id });
    }

    if (!Reservations) throw new Error("some error occured");

    res.status(200).json(Reservations);
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createReservation = async (req, res, next) => {
  const { userId, roomId, checkInDate, checkOutDate } = req.body;

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(
        errors
          .array()
          .map((err) => err.msg)
          .join(" , ")
      );
      error.statusCode = 422;
      throw error;
    }

    const findUser = await UserModel.findById(userId);

    if (!findUser) {
      const error = new Error("no such a user");
      error.statusCode = 409;
      throw error;
    }

    const room = await RoomModel.findById(roomId);

    if (!room) {
      const error = new Error("no such a room");
      error.statusCode = 404;
      throw error;
    } else if (room.status !== "available") {
      const error = new Error("This room is not avaliable");
      error.statusCode = 422;
      throw error;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reservation = await ReservationModel.create(
        [
          {
            userId,
            roomId,
            checkInDate,
            checkOutDate,
          },
        ],
        { session }
      );

      room.status = "reserved";
      await room.save({ session });

      await reservationQueue.add(
        { reservation_id: reservation._id },
        { delay: RESERVATION_EXPIRATION_TIME }
      );

      const mailOptions = {
        from: "islamabdelwahed61@gmail.com",
        to: findUser.email,
        subject: "please confirm your reservation",
        text: "Please confirm your reservation",
      };

      console.log(mailOptions.attachments);
      const info = await req.transporter.sendMail(mailOptions);
      console.log("Email sent: ", info.response);

      await session.commitTransaction();
      session.endSession();

      res
        .status(201)
        .json({ msg: "Reservation created succesfully", reservation });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Failed to create Reservation");
    }
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    if (!error.message) error.message = "some error occured";
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.updateReservation = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate, status } = req.body;

    const { role, id } = req.user;
    let Reservation;
    if (role === "guest") {
      Reservation = await ReservationModel.findOne({
        userId: id,
        _id: req.params.id,
      });
    } else {
      Reservation = await ReservationModel.findOne({ _id: req.params.id });
    }

    if (!Reservation) {
      const error = new Error("no such a Reservation");
      error.statusCode = 404;
      throw error;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(
        errors
          .array()
          .map((err) => err.msg)
          .join(" , ")
      );
      error.statusCode = 422;
      throw error;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      Reservation.checkInDate = checkInDate;
      Reservation.checkOutDate = checkOutDate;
      Reservation.status = status;

      if (roomId !== Reservation.roomId) {
        const desiredRoom = await RoomModel.findById(roomId);
        if (!desiredRoom) {
          const error = new Error("no such a room");
          error.statusCode = 404;
          throw error;
        } else if (desiredRoom.status !== "available") {
          const error = new Error("This room is already booked");
          error.statusCode = 422;
          throw error;
        }
        Reservation.roomId = roomId;
        desiredRoom.status = "occupied";
        await desiredRoom.save({ session });
        const oldRoom = await RoomModel.findByIdAndUpdate(
          Reservation.roomId,
          { status: "available" },
          { session }
        );
      }
      await Reservation.save({ session });

      await session.commitTransaction();
      session.endSession();

      res
        .status(201)
        .json({ msg: "Reservation created succesfully", Reservation });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Failed to create Reservation");
    }

    res.status(200).json({ msg: "Reservation updated successfully" });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.deleteReservation = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let Reservation;
    if (role === "guest") {
      Reservation = await ReservationModel.findOne({
        userId: id,
        _id: req.params.id,
      });
    } else {
      Reservation = await ReservationModel.findById({ _id: req.params.id });
    }

    if (!Reservation) {
      const error = new Error("no such a Reservation");
      error.statusCode = 404;
      throw error;
    }

    const deleteted = await ReservationModel.findByIdAndDelete(req.params.id);

    if (!deleteted) throw new Error("some error occured");

    res.status(200).json({ msg: "Reservation deleted successfully" });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getReservationById = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let Reservation;
    if (role === "guest") {
      Reservation = await ReservationModel.findOne({
        userId: id,
        _id: req.params.id,
      });
    } else {
      Reservation = await ReservationModel.findOne({ _id: req.params.id });
    }

    if (!Reservation) {
      const error = new Error("no such a Reservation");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(Reservation);
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.addServiceToReservation = async (req, res, next) => {
  try {
    const requested_services = req.body.services;

    const reservation = await ReservationModel.findById(req.params.id);

    if (!reservation) {
      const error = new Error("No such reservation");
      error.statusCode = 404;
      throw error;
    } else if (reservation.status !== "checked_in") {
      const error = new Error("Reservation is not confirmed yet");
      error.statusCode = 422;
      throw error;
    }

    let bill = await BillModel.findOne({ reservationId: reservation._id });

    let servicesIDs = requested_services.map(
      (ser) => new mongoose.Types.ObjectId(ser.serviceId)
    );
    const services = await ServiceModel.find({ _id: { $in: servicesIDs } });

    if (!services || services.length === 0) {
      const error = new Error("No matching services found");
      error.statusCode = 422;
      throw error;
    }

    let totalAmount = 0;
    let breakDown = [];
    for (let ser of requested_services) {
      let service = services.find(
        (s) => s._id.toString() === ser.serviceId.toString()
      );
      if (!service) {
        const error = new Error("Service not found");
        error.statusCode = 404;
        throw error;
      }
      totalAmount += service.price * ser.quantity;
      breakDown.push({ serviceId: service._id, quantity: ser.quantity });
    }

    if (!bill) {
      bill = new BillModel({ reservationId: reservation._id, totalAmount: 0 });
    }

    bill.totalAmount += totalAmount;
    bill.breakDown.push(...breakDown);

    await bill.save();

    res.status(201).json({ msg: "Services added successfully", totalAmount });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.processPaymentAtCheckout = async (req, res, next) => {
  const { reservationId } = req.params;
  const { paymentMethod } = req.body;

  try {
    const reservation = await ReservationModel.findById(reservationId);
    if (!reservation) {
      const error = new Error("No such reservation");
      error.statusCode = 404;
      throw error;
    } else if (reservation.status !== "checked_out") {
      const error = new Error("Reservation is not ready for payment");
      error.statusCode = 422;
      throw error;
    }

    let bill = await BillModel.findOne({ reservationId: reservationId });
    if (!bill) {
      bill = new BillModel({ reservationId: reservation._id, totalAmount: 0 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: bill.totalAmount * 100, // Convert to cents
      currency: "usd",
      payment_method: paymentMethod,
      confirm: true,
      description: `Payment for reservation ${reservationId}`,
    });

    const payment = new PaymentModel({
      reservationId: reservation._id,
      amount: totalAmount,
      paymentMethod: paymentMethod, // Replace with actual payment method
      transactionId: paymentIntent.id,
      status: "completed",
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await payment.save({ session });

      reservation.status = "completed";
      await reservation.save({ session });

      await session.commitTransaction();
      session.endSession();

      res
        .status(200)
        .json({ msg: "Payment processed successfully", payment, reservation });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Failed to check-out");
    }
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
