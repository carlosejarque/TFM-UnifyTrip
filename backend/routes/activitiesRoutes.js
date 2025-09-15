const express = require("express");
const router = express.Router();
const {
  getActivities,
  getActivityById,
  getActivitiesByItineraryId,
  createActivity,
  updateActivity,
  deleteActivity
} = require("../controllers/activitiesController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { activitySchema } = require("../schemas/activitySchema");

router.get("/", getActivities);
router.get("/:id", getActivityById);
router.get("/itinerary/:itinerary_id", getActivitiesByItineraryId);
router.post("/", authMiddleware, validateBody(activitySchema), createActivity);
router.put("/:id", authMiddleware, validateBody(activitySchema), updateActivity);
router.delete("/:id", authMiddleware, deleteActivity);

module.exports = router;
