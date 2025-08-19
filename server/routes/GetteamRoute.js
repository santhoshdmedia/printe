const {GetTeam,GetTeamById,AssignTeam,getAssignedTasks}= require("../controller/GetTeam")
const router = require("express").Router();

router.get('/get-team',GetTeam);

router.get('/get-team/:id',GetTeamById);

router.post('/Assign',AssignTeam);
router.get('/Get-task/:id',getAssignedTasks);

module.exports = router;

