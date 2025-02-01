require("dotenv").config();
const Queue = require("bull");
const ReservationModel = require("../models/reservation");
const RoomModel = require("../models/room");
const { startSession } = require("mongoose");

const reservationQueue = new Queue(
  "reservationExpiration",
  process.env.REDIS_URL
);

reservationQueue.process(async (job) => {
  try {
    const { reservationId } = job.data;

    const reservation = await ReservationModel.findById(reservationId);
    if (!reservation || reservation.status !== "pending") {
      return;
    }

    session = await startSession();
    session.startTransaction();

    await RoomModel.updateOne(
      { _id: reservation.roomId },
      { $set: { status: "available" } },
      { session }
    );

    await ReservationModel.updateOne(
      { _id: reservation._id },
      { $set: { status: "cancelled" } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    console.log(
      `Reservation ${reservationId} expired and room ${reservation.room_id} is now available.`
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error processing job:", error);
  }
});
