require("../../../tools/init");

describe("/api/users", () => {
  jest.setTimeout(30000);

  const props = {};
  let userUtils;

  beforeEach(() => {
    props.server = require("../../../../index");

    props.User = require("../../../../models/user").User;

    if (!userUtils) userUtils = require("../../../tools/userUtils");
  });

  afterEach(async () => {
    await props.server.close();
    await userUtils.db.clear();
  });

  // >>> POST <<<
  require("./post")(props);
});
