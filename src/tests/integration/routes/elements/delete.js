// external packages
const request = require("supertest");
const mongoose = require("mongoose");
// tools
const elementUtils = require("../../../tools/elementUtils");

module.exports = (props) => {
  describe("DELETE /:id", () => {
    let url, id, element;

    beforeEach(async () => {
      url = "/api/elements";
      element = await elementUtils.db.addElement();

      id = element.id;
    });

    const exec = (args = {}) => {
      id = args.id || id;
      url = `${url}/${id}`;

      return request(props.server).delete(url);
    };

    it("should return 404 if id is invalid", async () => {
      id = "1";
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if id wasn't found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 200 if request is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should remove the element in db if request is valid", async () => {
      await exec();

      const elementInDb = await props.Element.findById(id);

      expect(elementInDb).toBeNull();
    });

    it("shoud return the removed element", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", element.id);
      expect(res.body).toHaveProperty("name", element.name);
    });
  });
};
