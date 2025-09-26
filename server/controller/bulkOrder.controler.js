const { default: mongoose } = require("mongoose");
const { successResponse, errorResponse } = require("../helper/response.helper");
const { BulkOrderSchem } = require("./models_import");

const addBulkOrder = async (req, res) => {
  try {
    const data = await BulkOrderSchem.create(req.body);
    console.log(data);
    
    successResponse(res, "Sent Success");
  } catch (err) {
    console.log(err);
    errorResponse(err, "Sent Failed");
  }
};

const getBulkOrder = async (req, res) => {
  try {
    let where = {};
    const result = await BulkOrderSchem.aggregate([
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



module.exports = {
  addBulkOrder,
  getBulkOrder
};
