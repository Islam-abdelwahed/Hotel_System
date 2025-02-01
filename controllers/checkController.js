const mongoose = require("mongoose");
const BillModel = require("../models/bill");
const ReservationModel = require("../models/reservation");
const ServiceModel = require("../models/service");
const generateInvoice = require('../util/generateInvoice');

exports.checkin = async (req, res, next) => {
  try {
    const reservation = await ReservationModel.findById(req.params.id)
      .populate("userId")
      .populate("roomId");

    if (!reservation) {
      const error = new Error("no such a Reservation");
      error.statusCode = 404;
      throw error;
    } else if (reservation.status !== "confirmed") {
      const error = new Error("Reservation is not confirmed yet");
      error.statusCode = 422;
      throw error;
    }

    const room = reservation.roomId;

    if (!room) {
      const error = new Error("no such a room");
      error.statusCode = 404;
      throw error;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      reservation.status = "checked_in";
      // TODO: update check-in date to current date
      await reservation.save({ session });

      room.status = "occupied";
      await room.save({ session });

      const bill = new BillModel({
        reservationId: reservation._id,
        totalAmount: 0,
      });
      await bill.save({ session });

      const mailOptions = {
        from: "islamabdelwahed61@gmail.com",
        to: reservation.userId.email,
        subject: "Check-in confirmation",
        text: `You have checked in to room ${room.number}, ${room.type}.`,
      };

      const info = await req.transporter.sendMail(mailOptions);
      console.log("Email sent: ", info.response);

      await session.commitTransaction();
      session.endSession();
      res.status(200).json({ msg: "checked-in successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Failed to check-in");
    }
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.checkout = async (req, res, next) => {
  try {
    const reservation = await ReservationModel.findById(req.params.id)
      .populate("roomId")
      .populate("userId");

    if (!reservation) {
      const error = new Error("no such a Reservation");
      error.statusCode = 404;
      throw error;
    } else if (reservation.status !== "checked_in") {
      const error = new Error("Reservation is not checked-in yet");
      error.statusCode = 422;
      throw error;
    }

    const room = reservation.roomId;

    if (!room) {
      const error = new Error("no such a room");
      error.statusCode = 404;
      throw error;
    }

    let bill = await BillModel.findOne({
      reservationId: reservation._id,
    }).populate("breakDown.serviceId");

    if (!bill) {
      bill = new BillModel({ reservationId: reservation._id, totalAmount: 0 });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const checkOutDate = new Date().toISOString().split("T")[0];
      let days = calculateDays(reservation.checkInDate, checkOutDate);
      bill.totalAmount += room.price * days;
      reservation.status = "checked_out";
      reservation.checkOutDate = checkOutDate;
      await reservation.save({ session });

      room.status = "maintenance";
      await room.save({ session });

      await bill.save({ session });

      const invoiceData = {
        username: reservation.userId?.username || "Guest",
        email: reservation.userId?.email || "no-reply@example.com",
        items: [
          {
            serviceId: {
              name: `room ${room.number}, ${room.type}`,
              price: room.price,
            },
            quantity: days,
          },
          ...(bill.breakDown || []),
        ],
        amountPaid: bill.totalAmount,
        checkOutDate: reservation.checkOutDate,
      };

      const filePath = await generateInvoice(invoiceData);

      const mailOptions = {
        from: "islamabdelwahed61@gmail.com",
        to: reservation.userId.email,
        subject: "Thanks for enjoying your stay with us!",
        attachments: [
          {
            filename: filePath.split("/").pop(),
            path: filePath,
          },
        ],
      };

      console.log(mailOptions.attachments);
      const info = await req.transporter.sendMail(mailOptions);
      console.log("Email sent: ", info.response);

      await session.commitTransaction();
      session.endSession();
      res.status(200).json({ msg: "checked-out successfully", bill });
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

function calculateDays(checkInDate, checkOutDate) {
  const startDate = new Date(checkInDate);
  const endDate = new Date(checkOutDate);
  if (isNaN(startDate) || isNaN(endDate)) {
    throw new Error(
      "Invalid date format. Please provide dates in a valid format (e.g., YYYY-MM-DD)."
    );
  }
  const timeDifference = endDate - startDate;
  console.log(timeDifference);
  if (timeDifference === 0) {
    return 1;
  }
  const days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return Math.abs(days);
}
