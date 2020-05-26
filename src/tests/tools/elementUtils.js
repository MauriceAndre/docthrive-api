// models
const { getElement } = require("../../models/element");

const Utils = {
  db: {
    addElement: function (element, data = {}) {
      return new Promise(async (resolve, reject) => {
        const Element = await getElement("userId");

        element = element || {
          name: "DocThrive test document",
          type: 1,
          parentId: "1",
          labels: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...data,
        };

        element = new Element(element);
        await element.save();

        resolve();
      });
    },
    addManyElements: function (count) {
      const me = this;

      return new Promise(async (resolve, reject) => {
        for (let i = 0; i < count; i++) {
          await me.addElement();
        }

        resolve();
      });
    },
    clear: function () {
      return new Promise(async (resolve, reject) => {
        const Element = await getElement("userId");
        await Element.remove({});

        resolve();
      });
    },
  },
};

module.exports = Utils;
