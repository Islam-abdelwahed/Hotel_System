const fs = require("fs");
const path = require("path");
const Guest = require("../models/guest");

exports.getaddguest = (req, res, next) => {};

exports.postaddguest = (req, res, next) => {
  try {
    const { adderss, email, phone, firstName, lastName, nationalId, gender } =
      req.body;
    const p = path.join(
      path.dirname(require.main.filename),
      "data",
      "guests",
      nationalId + ".txt"
    );

    fs.access(p, (err) => {
      if (!err) return res.sendStatus(409);
      new Guest(
        firstName,
        lastName,
        adderss,
        email,
        phone,
        nationalId,
        gender
      ).save(() => {
        res.sendStatus(200);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

exports.posteditguest = (req, res, next) => {
    try {
        const { adderss, email, phone, firstName, lastName, nationalId, gender } =
          req.body;
        const p = path.join(
          path.dirname(require.main.filename),
          "data",
          "guests",
          nationalId + ".txt"
        );
    
        fs.access(p, (err) => {
          if (err) return res.status(404).json({msg:"no such a guest"});
          new Guest(
            firstName,
            lastName,
            adderss,
            email,
            phone,
            nationalId,
            gender
          ).save(() => {
            res.sendStatus(200);
          });
        });
      } catch (error) {
        console.log(error);
      }
};
