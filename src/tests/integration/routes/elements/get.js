// external packages
const request = require("supertest");
// tools
const elementUtils = require("../../../tools/elementUtils");

module.exports = (props) => {
  describe("GET", () => {
    let url, query, token;

    const exec = (args = {}) => {
      token = args.token !== undefined ? args.token : token;

      return request(props.server)
        .get(url)
        .set("x-auth-token", token)
        .query(query);
    };

    describe("/", () => {
      beforeEach(() => {
        token = require("../../../tools/userUtils").generateDefaultToken();

        url = "/api/elements";
        query = {};
      });

      // TODO: should return only a limited of elements and not all

      // authorization test
      require("../../test_snippets/auth")(exec);

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
