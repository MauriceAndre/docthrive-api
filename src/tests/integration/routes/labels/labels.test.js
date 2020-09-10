require("../../../tools/init");

describe("/api/labels", () => {
  jest.setTimeout(30000);

  const props = {};

  beforeEach(async () => {
    props.server = require("../../../../index");
    props.Label = await require("../../../../models/label").getLabel("userId");
  });

  afterEach(async () => {
    await props.server.close();
  });

  // >>> POST <<<
  require("./post")(props);
});
