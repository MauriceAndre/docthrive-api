// models
const { getElement } = require("../../../../models/element");
// tools
const elementUtils = require("../../../tools/elementUtils");

describe("/api/elements", () => {
  jest.setTimeout(30000);

  const props = {};

  beforeEach(async () => {
    require("../../../tools/init");
    props.server = require("../../../../index");
    props.Element = await getElement("userId");
  });

  afterEach(async () => {
    await props.server.close();
    await elementUtils.db.clear();
  });

  // >>> POST <<<
  require("./post")(props);

  // >>> GET <<<
  require("./get")(props);

  // >>> PUT <<<
  require("./put")(props);

  // >>> DELETE <<<
  require("./delete")(props);
});
