const error = require("../../../middleware/error");

describe("error middleware", () => {
  it("should response 500", () => {
    require("winston").error = jest.fn();
    const err = new Error("Exception");
    const req = {};
    const res = {
      status: jest.fn().mockReturnValue({
        send: jest.fn(),
      }),
    };

    error(err, req, res);

    expect(res.status.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(res.status.mock.calls[0][0]).toBe(500);
  });
});
