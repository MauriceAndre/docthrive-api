// external packages
const request = require("supertest");
// models
const { getElement } = require("../../../models/element");
// tools
const helper = require("../../tools/testing-helper");
const elementUtils = require("../../tools/elementUtils");

describe("/api/elements", () => {
  jest.setTimeout(30000);

  let server, Element;

  beforeEach(async () => {
    require("../../tools/init");
    server = require("../../../index");
    Element = await getElement("userId");
  });

  afterEach(async () => {
    await server.close();
    await elementUtils.db.clear();
  });

  describe("POST /", () => {
    let element;

    const initElement = () => {
      element = {
        name: "Contract Impark 2020",
        type: 2,
        parentId: "1",
        labels: ["1"],
      };
    };

    beforeEach(initElement);

    const exec = (exec = {}) => {
      let { body } = exec;
      const url = "/api/elements";

      body = body || element;

      return request(server).post(url).send(body);
    };

    // TODO:  should return 404 if type doesn't exist

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

      element = await Element.findOne();

      expect(element).not.toBeNull();
    });
  });

  describe("GET", () => {
    let url, query;

    const exec = (args = {}) => {
      return request(server).get(url).query(query);
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
});