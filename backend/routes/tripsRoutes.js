const express = require("express");
const router = express.Router();
const {getTrips, getTripById, createTrip, updateTrip, deleteTrip, getUserTrips} = require("../controllers/tripsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { tripSchema } = require("../schemas/tripSchema");

router.get("/", getTrips);
router.get("/my", authMiddleware, getUserTrips);
router.get("/:id", getTripById);
router.post("/", authMiddleware, validateBody(tripSchema), createTrip);
router.put("/:id", authMiddleware, validateBody(tripSchema), updateTrip);
router.delete("/:id", authMiddleware, deleteTrip);

module.exports = router;
