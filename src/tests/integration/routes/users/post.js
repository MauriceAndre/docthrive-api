// external modules
const request = require("supertest");
const moment = require("moment");
const mongoose = require("mongoose");
const config = require("config");
// tools
const helper = require("../../../tools/testing-helper");
const runtime = require("../../../tools/runtimeUtils");
const imapClient = require("../../../tools/imapClient");

module.exports = (props) => {
  describe("POST", () => {
    let user;

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
    });

    describe("/", () => {
      let userUtils;

      beforeEach(() => {
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

      it("should send a confirmation email", async () => {
        user.email = "test@maurice-schmid.com";
        const res = await exec();

        await runtime.sleep(10000); // wait to recieve email within 10s

        let connection, mails;
        try {
          connection = await imapClient.connect();
          await connection.openBox("INBOX");

          // search
          const searchCriteria = ["UNSEEN"];
          const fetchOptions = {
            bodies: ["HEADER"],
            markSeen: false,
          };
          const results = await connection.search(searchCriteria, fetchOptions);

          mails = results.filter((res) => {
            // filter latest emails
            const duration = moment().diff(res.attributes.date, "seconds");
            return duration < 60; // 60s = 1 minute
          });
        } catch (error) {
          throw error;
        } finally {
          if (connection) {
            await imapClient.deleteAllMessages(connection);
            connection.end();
          }
        }

        expect(mails.length).toBeGreaterThan(0);
        // compare subjects
        expect(mails[0].parts[0].body.subject[0]).toBe(
          config.get("mail.templates.register.subject")
        );
      });

      // should send a confirmation email
      // should hash userid
      // should activate account if confirmation URL was clicked
    });

    describe("/confirm", () => {
      let generateConfirmationURL;

      beforeEach(() => {
        generateConfirmationURL = require("../../../../models/user")
          .generateConfirmationURL;
      });

      const exec = async (args = {}) => {
        // create new user
        const body = args.body || user;
        const res = await request(props.server).post("/api/users").send(body);
        user = res.body;

        return activateUser(args.id);
      };

      const activateUser = (id) => {
        // confirm new user
        const _id = id || user._id;
        return request(props.server).post("/api/users/confirm").send({ _id });
      };

      it("should return 404 if userid is invalid", async () => {
        const id = mongoose.Types.ObjectId();
        const res = await exec({ id });

        expect(res.status).toBe(404);
      });

      it("should activate user in db", async () => {
        const res = await exec();

        const { active } = await props.User.findById(user._id);

        expect(res.status).toBe(200);
        expect(active).toBeTruthy();
      });

      it("should return 500 if user is already active", async () => {
        await exec();
        const res = await activateUser();

        expect(res.status).toBe(500);
      });

      // should approve access at login
      // should deny access at login if email wasn't confirmed
    });
  });
};
