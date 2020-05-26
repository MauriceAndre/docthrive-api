// models
const { getElement } = require("../../models/element");

const Utils = {
  db: {
    addElement: async function (element, data = {}) {
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

      return element;
    },
    addManyElements: async function (count) {
      for (let i = 0; i < count; i++) {
        await this.addElement();
      }
    },
    clear: async function () {
      const Element = await getElement("userId");
      await Element.remove({});
    },
  },
};

module.exports = Utils;
