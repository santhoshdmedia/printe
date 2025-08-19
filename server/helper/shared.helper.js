const bycrpt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { model } = require("mongoose");

const PlaintoHash = async (plain_text, hash_text) => {
  return await bycrpt.compare(plain_text, hash_text);
};

const EncryptPassword = async (password) => {
  return await bycrpt.hash(password, 12);
};

const GenerateToken = async (payload) => {
  try {
    return await jwt.sign(payload, process.env.SECRET_KEY);
  } catch (err) {
    throw err;
  }
};

const VerfiyToken = async (req, res, next) => {
  try {
    const token = _.get(req, "headers.authorization", "");
    if (!token) {
      return res.status(401).send({ message: "Invalid token" });
    } else {
      const result = await jwt.verify(token.split(" ")[1], process.env.SECRET_KEY);

      if (_.isEmpty(result)) {
        return res.status(401).send({ message: "Invalid token" });
      }
      req.userData = result;
      next();
    }
    return false;
  } catch (err) {
    console.error("Error verifying token:", err);
  }
};

module.exports = { PlaintoHash, EncryptPassword, GenerateToken, VerfiyToken };
