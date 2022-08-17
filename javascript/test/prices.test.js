const { createApp } = require("../src/prices");
const request = require("supertest");

describe("prices, no other criteria given", () => {
  let app, connection;

  beforeEach(async () => {
    ({ app, connection } = await createApp());
  });

  afterEach(function () {
    connection.close();
  });

  it("for 1jour", async () => {
    const response = await request(app).get("/prices?type=1jour");

    const expectedResult = { cost: 35 };
    expect(response.body).toEqual(expectedResult);
  });

  it("for night", async () => {
    const response = await request(app).get("/prices?type=night");

    const expectedResult = { cost: 0 };
    expect(response.body).toEqual(expectedResult);
  });
});

describe("prices, for children", () => {
  let app, connection;

  beforeEach(async () => {
    ({ app, connection } = await createApp());
  });

  afterEach(function () {
    connection.close();
  });

  describe("at night", () => {
    it("for children below the age 6, at night", async () => {
      const response = await request(app).get("/prices?type=night&age=5");

      const expectedResult = { cost: 0 };
      expect(response.body).toEqual(expectedResult);
    });
  });

  describe("at 1jour", () => {
    it("for children below the age 6, at 1jour", async () => {
      const response = await request(app).get("/prices?type=1jour&age=5");

      const expectedResult = { cost: 0 };
      expect(response.body).toEqual(expectedResult);
    });

    it("for children aged 6 and above till age 15, at 1jour", async () => {
      const response = await request(app).get("/prices?type=1jour&age=6");

      const expectedResult = { cost: 25 };
      expect(response.body).toEqual(expectedResult);
    });
  });
});

describe("prices, for regular folks", () => {
  let app, connection;

  beforeEach(async () => {
    ({ app, connection } = await createApp());
  });

  afterEach(function () {
    connection.close();
  });

  describe("at night", () => {
    it("for folks aged 6 and above, at night", async () => {
      const response = await request(app).get("/prices?type=night&age=6");

      const expectedResult = { cost: 19 };
      expect(response.body).toEqual(expectedResult);
    });
  });

  describe("at 1jour", () => {
    it("for folks aged 15 and above, at 1jour", async () => {
      const response = await request(app).get("/prices?type=1jour&age=15");

      const expectedResult = { cost: 35 };
      expect(response.body).toEqual(expectedResult);
    });
  });
});

describe("prices, for senior folks", () => {
  let app, connection;

  beforeEach(async () => {
    ({ app, connection } = await createApp());
  });

  afterEach(function () {
    connection.close();
  });

  describe("at night", () => {
    it("for senior folks aged 65 and above, at night", async () => {
      const response = await request(app).get("/prices?type=night&age=65");

      const expectedResult = { cost: 8 };
      expect(response.body).toEqual(expectedResult);
    });
  });

  describe("at 1jour", () => {
    it("for senior folks aged 65 and above, at 1jour", async () => {
      const response = await request(app).get("/prices?type=1jour&age=65");

      const expectedResult = { cost: 27 };
      expect(response.body).toEqual(expectedResult);
    });
  });
});
