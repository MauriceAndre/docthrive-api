module.exports = function (exec) {
  it("should return 401 if token is not provided", async () => {
    const token = "";
    const res = await exec({ token });

    expect(res.status).toBe(401);
  });

  it("should return 401 if token is invalid", async () => {
    const token = "a";
    const res = await exec({ token });

    expect(res.status).toBe(401);
  });
};
