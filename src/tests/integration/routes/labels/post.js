// external packages
const request = require("supertest");
// tools
const helper = require("../../../tools/testing-helper");

module.exports = (props) => {
  describe("POST /", () => {
    let label, token;

    const initLabel = () => {
      label = {
        name: "My label",
        custom: true,
      };
    };

    beforeEach(() => {
      token = token = require("../../../tools/userUtils").generateDefaultToken();

      initLabel();
    });

    const exec = (args = {}) => {
      token = args.token !== undefined ? args.token : token;
      const url = "/api/labels";

      let body = args.body || label;

      return request(props.server)
        .post(url)
        .set("x-auth-token", token)
        .send(body);
    };

    // authorization test
    require("../../test_snippets/auth")(exec);

    it("should return 400 if request is invalid", async () => {
      label = {};
      const res = await exec();

      expect(res.status).toBe(400);
    });

    describe("request body", function () {
      initLabel();
      const schema = {
        name: {
          value: label.name,
          max: 25,
          required: true,
          type: String,
        },
        custom: {
          value: label.custom,
          type: Boolean,
        },
      };

      helper.post.requestBody(schema, 400, exec);
    });

    it("should return label object if request is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining(["_id", "name", "custom"])
      );
    });

    it("should create db entry if request is valid", async () => {
      await exec();

      label = await props.Label.findOne();

      expect(label).not.toBeNull();
    });
  });
};
