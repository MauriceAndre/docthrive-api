// external modules
const mongoose = require("mongoose");
// models
const { getActivity } = require("../../models/elementActivity");

const Utils = {
  db: {
    addActivity: async function (activity, data = {}) {
      const Activity = await getActivity("userId");

      activity = activity || {
        elementId: mongoose.Types.ObjectId(),
        action: {
          name: "CREATE",
          params: {
            name: "My element name",
          },
        },
        createdAt: Date.now(),
        ...data,
      };

      activity = new Activity(activity);
      await activity.save();

      return activity;
    },
    addManyActivities: async function (count) {
      for (let i = 0; i < count; i++) {
        await this.addActivity();
      }
    },
    clear: async function () {
      const Activity = await getActivity("userId");
      await Activity.remove({});
    },
  },
};

module.exports = Utils;
