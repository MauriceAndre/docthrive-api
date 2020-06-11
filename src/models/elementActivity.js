// external modules
const mongoose = require("mongoose");
const _ = require("lodash");
// db
const { user } = require("../db/connection");
// utils
const { cropFunc, diff } = require("../utils/objectUtils");

const activitySchema = new mongoose.Schema({
  elementId: { type: mongoose.Types.ObjectId, required: true },
  action: {
    name: { type: String, required: true },
    before: Object,
    after: Object,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

const getAction = function (oldState, newState) {
  let name = null;

  // CREATE
  if (oldState === null && newState) {
    name = Types.CREATE;
  } else {
    // get diffrences of objects
    const elementKeys = require("./element").reqKeys;
    oldState = _.pick(oldState, elementKeys);
    newState = _.pick(newState, elementKeys);

    const keys = diff(oldState, newState);

    // RENAME & EDIT_META
    const edited = ["type", "labels"].find((key) => keys.includes(key));
    if (keys.includes("name")) {
      name = Types.RENAME;

      if (edited) name = Types.EDIT_META;
    } else if (edited) name = Types.EDIT_META;

    // MOVE
    if (keys.includes("parentId")) name = Types.MOVE;

    // DELETE
    if (keys.includes("deleted") && newState.deleted) name = Types.DELETE;

    oldState = _.pick(oldState, keys);
    newState = _.pick(newState, keys);
  }

  if (name) {
    return {
      name,
      before: oldState,
      after: newState,
    };
  }

  return null;
};

const detectActivity = async function (userId, oldElement, newElement) {
  let action = getAction(oldElement, newElement);

  if (action) {
    const activity = {
      elementId: newElement._id,
      action,
    };
    await addActivity(userId, activity);
  }
};

const getActivity = async function (userId) {
  const userDb = await user(userId);
  const Activity = userDb.model("Element-Activity", activitySchema);

  return Activity;
};

const addActivity = async function (userId, activity) {
  const Activity = await getActivity(userId);
  activity = new Activity(activity);
  await activity.save();
};

const Types = {
  CREATE: "CREATE",
  RENAME: "RENAME",
  EDIT_META: "EDIT_META",
  MOVE: "MOVE",
  DELETE: "DELETE",
};
const resKeys = ["_id", "elementId", "action", "createdAt"];
const filterKeys = ["elementId", "action.name", "createdAt"];

module.exports = {
  getActivity,
  cropResponse: cropFunc(resKeys),
  getAction,
  addActivity,
  detectActivity,
  filterKeys,
  resKeys,
};
