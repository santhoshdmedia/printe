const ejs = require("ejs");
const fs = require("fs");
const { template } = require("lodash");
const path = require("path");
const TemplateHelper = (value) => {
  switch (value.target) {
    case "reset password": {
      return {
        subject: "Forgot Your Password? Here’s How to Reset It",
        templete: ejs.render(fs.readFileSync(path.join(__dirname, "./forgetpassword.ejs"), "utf-8"), value),
      };
    }
    case "placed order": {
      return {
        subject: "Your Order Has Been Successfully Placed! 🎉",
        template: ejs.render(fs.readFileSync(path.join(__dirname, "./orderplaced.ejs"), "utf-8"), value),
      };
    }
    case "order status": {
      return {
        subject: "Hey Your Order Is On The Way! 🚐",
        template: ejs.render(fs.readFileSync(path.join(__dirname, "./orderstatus.ejs"), "utf-8"), value, console.log(value, "templates values")),
      };
    }
  }
};

module.exports = { TemplateHelper };
