const { default: mongoose } = require("mongoose");
const { successResponse, errorResponse } = require("../helper/response.helper");
const { inquiryMail } = require("../mail/sendMail");
const { EnquiresSchema } = require("./models_import");

const addenquires = async (req, res) => {
  try {
    const data = await EnquiresSchema.create(req.body);

    await inquiryMail(data);

    successResponse(res, "Sent Success");
  } catch (err) {
    console.log(err);
    errorResponse(err, "Sent Failed");
  }
};

const getenquires = async (req, res) => {
  try {
    let where = {};
    const result = await EnquiresSchema.aggregate([
      {
        $match: where,
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    successResponse(res, " ", result);
  } catch (err) {
    console.log(err);
  }
};

const getsinglnquires = async (req, res) => {
  try {
    const { _id } = JSON.parse(req.params.id);
    let where = {};
    if (_id) {
      where._id = new mongoose.Types.ObjectId(_id);
    }
    const resutl = await EnquiresSchema.aggregate([
      {
        $match: where,
      },
    ]);
    successResponse(res, "", resutl);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  addenquires,
  getenquires,
  getsinglnquires,
};
