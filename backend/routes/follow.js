const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");

router.get("/Prueba-Follows", FollowController.PruebaFollows);

module.exports = router;