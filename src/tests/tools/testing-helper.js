const logger = require("../../utils/logger");

const post = {
  requestBody: function (schema, status, exec) {
    const keys = Object.keys(schema);

    keys.forEach((key) => {
      const obj = schema[key];
      const args = [schema, key, obj, status, exec];
      let test;

      switch (obj.type) {
        case String:
          test = this.test.string;
          break;
        case Number:
          test = this.test.number;
          break;
        case Date:
          test = this.test.date;
          break;
        case Array:
          test = this.test.array;
          break;
        case "email":
          test = this.test.email;
          break;
        case undefined:
          logger.info("Type is undefined.", obj);
          return;
        default:
          throw new Error("Type is invalid.");
      }

      test.run.apply(test, args);
    });
  },
  test: {
    string: {
      min: (...args) => post.test.run.apply(null, args),
      max: (...args) => post.test.run.apply(null, args),
      required: (...args) => post.test.run.apply(null, args),

      run: function (schema, key, obj, status, exec) {
        this.min(
          schema,
          key,
          `less than ${obj.min} chars`,
          status,
          (body) => {
            body[key] = new Array(obj.min).join("a");
          },
          exec
        );
        this.max(
          schema,
          key,
          `more than ${obj.max} chars`,
          status,
          (body) => {
            body[key] = new Array(obj.max + 2).join("a");
          },
          exec
        );
        this.required(
          schema,
          key,
          "missing",
          status,
          (body) => {
            delete body[key];
          },
          exec
        );
      },
    },
    number: {
      min: (...args) => post.test.run.apply(null, args),
      max: (...args) => post.test.run.apply(null, args),
      required: (...args) => post.test.run.apply(null, args),

      run: function (schema, key, obj, status, exec) {
        this.min(
          schema,
          key,
          `less than ${obj.min}`,
          status,
          (body) => {
            body[key] = obj.min - 1;
          },
          exec
        );
        this.max(
          schema,
          key,
          `more than ${obj.max}`,
          status,
          (body) => {
            body[key] = obj.max + 1;
          },
          exec
        );
        this.required(
          schema,
          key,
          "missing",
          status,
          (body) => {
            delete body[key];
          },
          exec
        );
      },
    },
    array: {
      min: (...args) => post.test.run.apply(null, args),
      max: (...args) => post.test.run.apply(null, args),
      required: (...args) => post.test.run.apply(null, args),

      run: function (schema, key, obj, status, exec) {
        this.min(
          schema,
          key,
          `less than ${obj.min} array items`,
          status,
          (body) => {
            body[key] = new Array(obj.min).fill("a");
          },
          exec
        );
        this.max(
          schema,
          key,
          `more than ${obj.max} array items`,
          status,
          (body) => {
            body[key] = new Array(obj.max + 1).fill("a");
          },
          exec
        );
        this.required(
          schema,
          key,
          "missing",
          status,
          (body) => {
            delete body[key];
          },
          exec
        );
      },
    },
    email: {
      max: (...args) => post.test.run.apply(null, args),
      required: (...args) => post.test.run.apply(null, args),

      run: function (schema, key, obj, status, exec) {
        this.max(
          schema,
          key,
          `more than ${obj.max} chars`,
          status,
          (body) => {
            body[key] = new Array(obj.max).join("a") + "@mail.com";
          },
          exec
        );
        this.required(
          schema,
          key,
          "missing",
          status,
          (body) => {
            delete body[key];
          },
          exec
        );
      },
    },
    date: {
      required: (...args) => post.test.run.apply(null, args),

      run: function (schema, key, obj, status, exec) {
        this.required(
          schema,
          key,
          "missing",
          status,
          (body) => {
            delete body[key];
          },
          exec
        );
      },
    },
    run: function (schema, key, desc, status, fnc, exec) {
      const prop = arguments.callee.caller.name;

      if (!schema[key][prop]) return;

      const body = {};

      for (const item in schema) {
        body[item] = schema[item].value;
      }
      fnc(body);

      it(`should return ${status} if ${key} is ${desc}`, async () => {
        const res = await exec({ body });

        expect(res.status).toBe(status);
      });
    },
  },
};

const get = {};

const Helper = {
  post,
  get,
};

module.exports = Helper;
