const path = require("../util/path");
const RoomModel = require("../models/room");
const ReservationModel = require("../models/reservation");
const mongoose = require("mongoose");

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.addRoom = async (req, res, next) => {
  try {
    const duplicate = (await RoomModel.find()).find(
      (room) => room.number === req.body.number
    );

    if (duplicate) {
      const error = new Error("This room is already exsits");
      error.statusCode = 409;
      throw error;
    }

    const newRoom = await RoomModel.create({ ...req.body });

    if (!newRoom) {
      const error = new Error("Some error occured");
      throw error;
    }

    res.status(201).json({ msg: "room created successfully" });
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
exports.deleteRoom = async (req, res, next) => {
  try {
    const findRoom = await RoomModel.findByIdAndDelete({ _id: req.params.id });

    if (!findRoom) {
      const error = new Error("no such a room");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ msg: "room deleted successfully" });
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
exports.updateRoom = async (req, res, next) => {
  try {
    const findRoom = await RoomModel.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body },
      { new: true }
    );

    if (!findRoom) {
      const error = new Error("no such a room");
      error.statusCode = 404;
      throw error;
    }

    res.status(201).json(findRoom);
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
exports.getRooms = async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate } = req.query;

    const { role } = req.user;
    let rooms;
    if (role === "admin" || role === "reciption") {
      rooms = await RoomModel.find();
    } else if (role === "guest") {

      if (
        !checkInDate ||
        !checkOutDate ||
        isNaN(new Date(checkInDate)) ||
        isNaN(new Date(checkOutDate))
      ) {
        return res
          .status(400)
          .json({ message: "Invalid or missing date parameters" });
      }
      // TODO room availability check
      const reservations = await ReservationModel.find({
        checkInDate: { $lte:  new Date(checkOutDate) }, // Reservation starts before or on check-out date
        checkOutDate: { $gte: new Date(checkInDate) }, // Reservation ends after or on check-in date
        status: {
          $in: ["confirmed", "checked_in"], // Only consider active reservations
        },
      });

      const reservedRoomIds = reservations.map((res) =>
        res.roomId.toString()
      );

      rooms = await RoomModel.find({
        _id: { $nin: reservedRoomIds }, 
        status: "available",// Exclude reserved rooms
      });
    }

    if (!rooms) {
      const error = new Error("no such a room");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(rooms);
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

/**
 *
 *
 *
 */
exports.getRoomById = async (req, res, next) => {
  try {
    const room = await RoomModel.findById({ _id: req.params.id });

    if (!room) {
      const error = new Error("no such a room");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(room);
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
