const intro =require('../modals/intro.modal')
const { errorResponse, successResponse } = require("../helper/response.helper");

const addmain = async (req, res) => {
  try {
    const result = await intro.create(req.body);
    return successResponse(res, "added intro");
  } catch (err) {
    console.log(err);
    return errorResponse(res, "err intro");
  }
};


module.exports = {
  addmain
};
