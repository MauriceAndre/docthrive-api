// models
const { User } = require("../../models/user");

const Utils = {
  db: {
    addUser: function (user, unique) {
      const rondom = unique ? Math.random(1000) : "";

      user = user || {
        firstName: "Maurice",
        lastName: "Schmid",
        email: `maurice.schmid${rondom}@mail.com`,
        password: "password1",
      };

      user = new User(user);
      return user.save();
    },

    addManyUsers: async function (count = 2) {
      for (let i = 0; i < count; i++) {
        await this.addUser({
          firstName: `Test${i}`,
          lastName: `User${i}`,
          email: `test.user${i}@mail.com`,
          password: `password${i}`,
        });
      }
    },

    clear: function () {
      return User.remove({});
    },
  },
  generateAdminToken: function () {
    const user = { _id: "userId", isAdmin: true };
    return User.generateJWT(user);
  },
  generateDefaultToken: function () {
    const user = { _id: "userId", isAdmin: false };
    return User.generateJWT(user);
  },
};

module.exports = Utils;
