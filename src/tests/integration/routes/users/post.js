// external modules
const request = require("supertest");
// tools
const helper = require("../../../tools/testing-helper");

module.exports = (props) => {
  describe("POST /", () => {
    let user, userUtils;

    const initUser = () => {
      user = {
        firstName: "Maurice",
        lastName: "Schmid",
        email: "maurice.schmid@mail.com",
        password: "123Test456",
      };
    };

    beforeEach(() => {
      initUser();

      if (!userUtils) userUtils = require("../../../tools/userUtils");
    });

    const exec = (args = {}) => {
      const body = args.body || user;
      return request(props.server).post("/api/users").send(body);
    };

    it("should return 400 if request object is invalid", async () => {
      user = {};
      const res = await exec();

      expect(res.status).toBe(400);
    });

    describe("request body", function () {
      initUser();

      const schema = {
        firstName: {
          value: user.firstName,
          min: 3,
          max: 30,
          required: true,
          type: String,
        },
        lastName: {
          value: user.lastName,
          min: 3,
          max: 30,
          required: true,
          type: String,
        },
        password: {
          value: user.password,
          min: 6,
          max: 255,
          required: true,
          type: String,
        },
        email: {
          value: user.email,
          min: 3,
          max: 255,
          required: true,
          type: "email",
        },
      };
      helper.post.requestBody(schema, 400, exec);

      it("should return 400 if email is not valid", async () => {
        user.email = "myEmail";
        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    it("should return 500 if user is already registred", async () => {
      await userUtils.db.addUser(user);

      const res = await exec();

      expect(res.status).toBe(500);
    });

    it("should return user object and JWT if request is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining(["_id", "firstName", "lastName", "email"])
      );
      expect(res.header).toHaveProperty("x-auth-token");
    });

    it("should save user in db if request is valid", async () => {
      await exec();

      const userDb = await props.User.findOne({ email: user.email });

      expect(userDb).not.toBeNull();
    });

    it("should save encrypted password in db", async () => {
      const res = await exec();
      const userDb = await props.User.findById(res.body._id);

      const match = await userDb.comparePassword(user.password);
      expect(match).toBeTruthy();
    });
  });
};
