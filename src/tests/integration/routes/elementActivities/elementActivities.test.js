// external packages
const request = require("supertest");
const mongoose = require("mongoose");
// models
const { getActivity } = require("../../../../models/elementActivity");
const { getElement } = require("../../../../models/element");
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

  describe("add activities", () => {
    let token, url, Element, element, elementId, method;

    beforeEach(async () => {
      token = require("../../../tools/userUtils").generateDefaultToken();
      url = "/api/elements";
      method = "put";
      element = {
        name: "Contract Impark 2020",
        type: 2,
        parentId: "1",
        labels: ["1"],
      };

      Element = await getElement("userId");
      elementId = "";
    });

    const createDbElement = async () => {
      const el = new Element(element);
      await el.save();
      elementId = el._id;
    };

    const exec = (args = {}) => {
      token = args.token !== undefined ? args.token : token;

      switch (method) {
        case "post":
          method = request(server).post(url);
          break;
        case "put":
        default:
          method = request(server).put(`${url}/${elementId}`);
          break;
      }

      return method.set("x-auth-token", token).send(element);
    };

    it("should add CREATE activity if /api/elements recieve new element", async () => {
      method = "post";
      await exec();

      const activities = await Activity.find();

      expect(activities.length).toBe(1);
      expect(activities[0].action.name).toBe("CREATE");
    });

    it("should add RENAME activity if /api/elements recieve renamed element", async () => {
      await createDbElement();

      element.name = "My new name";
      await exec();

      const activities = await Activity.find();

      expect(activities.length).toBe(1);
      expect(activities[0].action.name).toBe("RENAME");
    });

    it("should add EDIT_META activity if /api/elements recieve changed meta", async () => {
      await createDbElement();

      element.name = "My new name";
      element.labels = ["2"];
      await exec();

      const activities = await Activity.find();

      expect(activities.length).toBe(1);
      expect(activities[0].action.name).toBe("EDIT_META");
    });

    it("should add MOVE activity if /api/elements recieve moved element", async () => {
      await createDbElement();

      element.parentId = mongoose.Types.ObjectId().toHexString();
      await exec();

      const activities = await Activity.find();

      expect(activities.length).toBe(1);
      expect(activities[0].action.name).toBe("MOVE");
    });

    it("should add DELETE activity if /api/elements recieve deleted element", async () => {
      await createDbElement();

      element.deleted = true;
      await exec();

      const activities = await Activity.find();

      expect(activities.length).toBe(1);
      expect(activities[0].action.name).toBe("DELETE");
    });
  });
});
