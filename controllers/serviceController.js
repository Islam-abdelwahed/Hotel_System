const service = require("../models/service");
const ServiceModel = require("../models/service");

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.addService = async (req, res, next) => {
  try {
    const duplicate = await ServiceModel.findOne({ name: req.body.name });

    if (duplicate) {
      const error = new Error("This Service is already exsits");
      error.statusCode = 409;
      throw error;
    }

    const newService = await ServiceModel.create({ ...req.body });

    if (!newService) {
      const error = new Error("Some error occured");
      throw error;
    }

    res.status(201).json({ msg: "Service added successfully" });
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
exports.getServices = async (req, res, next) => {
  try {
    const services = await ServiceModel.find();

    if (!service) throw new Error("some error occured");

    res.status(200).json(services);
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
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await ServiceModel.findOne({ _id: req.params.id });

    if (!service) {
      const error = new Error("no such a service");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(service);
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
exports.deleteService = async (req, res, next) => {
  try {
    const service = await ServiceModel.findById(req.params.id);

    if (!service) {
      const error = new Error("no such a service");
      error.statusCode = 404;
      throw error;
    }

    const deleteted = await ServiceModel.findByIdAndDelete(req.params.id);

    if (!deleteted) throw new Error("some error occured");

    res.status(200).json({ msg: "Service deleted successfully" });
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
exports.updateService = async (req, res, next) => {
  try {
    const service = await ServiceModel.findById(req.params.id);

    if (!service) {
      const error = new Error("no such a service");
      error.statusCode = 404;
      throw error;
    }

    const deleteted = await ServiceModel.findByIdAndUpdate(req.params.id, {
      ...req.body,
    });

    if (!deleteted) throw new Error("some error occured");

    res.status(200).json({ msg: "Service updated successfully" });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.addServiceToBooking = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.bookingId);
    if (!booking) {
      const error = new Error("no such a booking");
      error.statusCode = 404;
      throw error;
    }

    const service = await ServiceModel.findById(req.params.serviceId);
    if (!service) {
      const error = new Error("no such a service");
      error.statusCode = 404;
      throw error;
    }

    const serviceExist = booking.services.find(
      (serviceItem) =>
        serviceItem.serviceId.toString() === service._id.toString()
    );

    if (serviceExist) {
      serviceExist.quantity += req.body.quantity;
    } else {
      booking.services.push({
        serviceId: service._id,
        quantity: req.body.quantity,
      });
    }

    booking.totalPrice += service.price * req.body.quantity;

    await booking.save();

    res.status(201).json({ msg: "Service added to booking successfully" });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
