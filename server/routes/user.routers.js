const { clientLogin, clientSignup,customSignup,getAllCustomUsers, clientCheckloginstatus, getAllClientUsers, deleteClientUser,clientgoogleLogin, updateClientUser, getblog, getSingleClient, addtoHistory,BNISignup } = require("./controller_import");
const router = require("express").Router();
const { VerfiyToken } = require("../helper/shared.helper");
const { userVerifyTest } = require("../controller/user.controller");

router.post("/login", clientLogin);
router.post("/google_login", clientgoogleLogin);
router.post("/signup", clientSignup);
router.post("/custom_signup", customSignup);
router.get("/get_all_custom_users", getAllCustomUsers);
router.get("/get_all_client_users/:id", getAllClientUsers);
router.post("/delete_client_user", VerfiyToken, deleteClientUser);
router.put("/update_client_user/:id", updateClientUser);
router.get("/check_login", VerfiyToken, clientCheckloginstatus);
router.get("/get_sinlge_client/:id", getSingleClient);
router.post("/user-Test", userVerifyTest);

// blogs
router.get("/get_all_blogs", getblog);

// history
router.post("/add_to_history", VerfiyToken, addtoHistory);
router.post("/bnisignup", BNISignup);


module.exports = router;
