// external modules
const mongoose = require("mongoose");
const _ = require("lodash");
// db
const { user } = require("../db/connection");
// utils
const { cropFunc } = require("../utils/objectUtils");

const activitySchema = new mongoose.Schema({
  elementId: { type: mongoose.Types.ObjectId, required: true },
  action: {
    name: String,
    params: Object,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

const getActivity = async function (id) {
  const userDb = await user(id);
  const Activity = userDb.model("ElementActivity", activitySchema);

  return Activity;
};

const resKeys = ["_id", "elementId", "action", "createdAt"];
const filterKeys = ["elementId", "action", "createdAt"];

module.exports = {
  getActivity,
  cropResponse: cropFunc(resKeys),
  filterKeys,
  resKeys,
};
