const { addblog, getblog, editblog, deleteblog } = require("./controller_import");

const router = require("express").Router();

router.post("/add_blog", addblog);
router.get("/get_all_blog", getblog);
router.put("/edit_blog/:id", editblog);
router.delete("/delete_blog/:id", deleteblog);

module.exports = router;
