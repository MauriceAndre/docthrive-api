// external packages
const request = require("supertest");
const mongoose = require("mongoose");
// models
const { getActivity } = require("../../../../models/elementActivity");
// tools
const activitiyUtils = require("../../../tools/elementActivityUtils");

require("../../../tools/init");

describe("/api/element-activities", () => {
  jest.setTimeout(30000);

  let server, Activity;

  beforeEach(async () => {
    server = require("../../../../index");
    Activity = await getActivity("userId");
  });

  afterEach(async () => {
    await server.close();
    await activitiyUtils.db.clear();
  });

  describe("GET /", () => {
    let url, token, query;

    beforeEach(() => {
      token = require("../../../tools/userUtils").generateDefaultToken();
      url = "/api/element-activities";
      query = {};
    });

    const exec = (args = {}) => {
      token = args.token !== undefined ? args.token : token;

      return request(server).get(url).set("x-auth-token", token).query(query);
    };

    // authorization test
    require("../../test_snippets/auth")(exec);

    it("should return activities if request is valid", async () => {
      await activitiyUtils.db.addManyActivities(2);

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should filter activities if request contains query", async () => {
      const elementId = mongoose.Types.ObjectId();
      query = { elementId: elementId.toHexString() };

      activitiyUtils.db.addActivity(null, {
        elementId: mongoose.Types.ObjectId(),
      });
      activitiyUtils.db.addActivity(null, { elementId });

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].elementId).toBe(query.elementId);
    });
  });
});
