// external packages
const request = require("supertest");
// tools
const elementUtils = require("../../../tools/elementUtils");

module.exports = (props) => {
  describe("GET", () => {
    let url, query;

    const exec = (args = {}) => {
      return request(props.server).get(url).query(query);
    };

    describe("/", () => {
      beforeEach(() => {
        url = "/api/elements";
        query = {};
      });

      // TODO: should return only a limited of elements and not all

      it("should return elements if request is valid", async () => {
        await elementUtils.db.addManyElements(2);

        const res = await exec();

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
      });

      it("should filter elements if request contains query", async () => {
        query = { parentId: "2" };

        elementUtils.db.addElement(null, { parentId: "1" });
        elementUtils.db.addElement(null, { parentId: query.parentId });

        const res = await exec();

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].parentId).toBe(query.parentId);
      });
    });
  });
};
