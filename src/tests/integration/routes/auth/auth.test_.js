describe("/api/auth", () => {
  let server;

  beforeEach(() => {
    server = require("../../../../index");
  });

  afterEach(async () => {
    await server.close();
  });
});
