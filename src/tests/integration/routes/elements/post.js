// external packages
const request = require("supertest");
// tools
const helper = require("../../../tools/testing-helper");

module.exports = (props) =>
  describe("POST /", () => {
    let element, token;

    const initElement = () => {
      element = {
        name: "Contract Impark 2020",
        type: 2,
        parentId: "1",
        labels: ["1"],
      };
    };

    beforeEach(() => {
      token = require("../../../tools/userUtils").generateDefaultToken();

      initElement();
    });

    const exec = (args = {}) => {
      token = args.token !== undefined ? args.token : token;
      const url = "/api/elements";

      let body = args.body || element;

      return request(props.server)
        .post(url)
        .set("x-auth-token", token)
        .send(body);
    };

    // TODO:  should return 404 if type doesn't exist

    // authorization test
    require("../../test_snippets/auth")(exec);

    it("should return 400 if request is invalid", async () => {
      element = {};
      const res = await exec();

      expect(res.status).toBe(400);
    });

    describe("request body", function () {
      initElement();
      const schema = {
        name: {
          value: element.name,
          min: 1,
          max: 50,
          required: true,
          type: String,
        },
        type: {
          value: element.type,
          min: 1,
          max: 700,
          required: true,
          type: Number,
        },
        parentId: { value: element.parentId, required: true, type: String },
        labels: { value: element.labels, type: Array },
      };

      helper.post.requestBody(schema, 400, exec);
    });

    it("should return element object if request is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining([
          "_id",
          "name",
          "type",
          "parentId",
          "labels",
          "createdAt",
          "updatedAt",
        ])
      );
    });

    it("should create db entry if request is valid", async () => {
      await exec();

      element = await props.Element.findOne();

      expect(element).not.toBeNull();
    });
  });
