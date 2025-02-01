const fs = require("fs");
const path = require("path");

module.exports = class guest {
  constructor(firstName, lastName, adderss, email, phone, nationalId, gender) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.adderss = adderss;
    this.email = email;
    this.phone = phone;
    this.nationalId = nationalId;
    this.gender = gender;
  }

  save(callback) {
    const p = path.join(
      path.dirname(require.main.filename),
      "data",
      "guests",
      this.nationalId+".txt"
    );
    fs.writeFile(p, JSON.stringify(this), {encoding:"utf8"},(err) => {
      if(!err) callback();

      console.log(err);
    });
  }
};
