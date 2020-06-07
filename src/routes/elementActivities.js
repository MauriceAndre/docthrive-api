// external modules
const express = require("express");
// middleware
const auth = require("../middleware/auth");
const cropQuery = require("../middleware/cropQuery");
// models
const {
  getActivity,
  filterKeys,
  resKeys,
} = require("../models/elementActivity");

const router = express.Router();

router.get("/", [auth, cropQuery(filterKeys)], async (req, res) => {
  const Activity = await getActivity(req.user._id);

  const activities = await Activity.find(req.query).select(resKeys.join(" "));

  res.send(activities);
});

module.exports = router;
