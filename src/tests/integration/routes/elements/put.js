// external packages
const request = require("supertest");
const mongoose = require("mongoose");
// tools
const elementUtils = require("../../../tools/elementUtils");

module.exports = (props) => {
  describe("PUT /:id", () => {
    let url, id, name, element, token;

    beforeEach(async () => {
      token = require("../../../tools/userUtils").generateDefaultToken();
      url = "/api/elements";
      element = await elementUtils.db.addElement();

      id = element.id;
      name = "New updated name";
      data = null;
    });

    const exec = async (args = {}) => {
      token = args.token !== undefined ? args.token : token;
      data = args.data || data || { name };
      const body = args.body || { ...element, ...data };
      id = args.id || id;
      url = `${url}/${id}`;

      return await request(props.server)
        .put(url)
        .set("x-auth-token", token)
        .send(body);
    };

    // authorization test
    require("../../test_snippets/auth")(exec);

    it("should return 404 if id is invalid", async () => {
      id = "1";
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if element with the given id wasn't found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should update the element if request is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should only update element if values changed", async () => {
      data = {};
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("updatedAt", element.updatedAt.toJSON());
    });

    it("should update the element in db", async () => {
      await exec();

      const elementDb = await props.Element.findById(id);

      expect(elementDb).not.toBeNull();
      expect(elementDb).toHaveProperty("name", name);
      expect(elementDb.updatedAt).not.toBe(element.updatedAt);
    });

    it("should return the updated element if request is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", element.id);
      expect(res.body).toHaveProperty("name", name);
      expect(res.body.updatedAt).not.toBe(element.updatedAt.toJSON());
    });

    it("should set deletedAt if deleted changed to true", async () => {
      data = { deleted: true };
      const res = await exec();

      expect(res.body.deleted).toBeTruthy();
      expect(res.body.deletedAt).not.toBeUndefined();
    });

    // TODO: should only update allowed keys && validate body
  });
};
