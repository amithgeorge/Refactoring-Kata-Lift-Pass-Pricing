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

  it("for children below the age 6, any type of pass, any day of week, holiday or not", async () => {
    const response = await request(app).get("/prices?age=5");

    const expectedResult = { cost: 0 };
    expect(response.body).toEqual(expectedResult);
  });

  describe.skip("at night", () => {});

  describe("at 1jour", () => {
    it.skip("for children below the age 6, at 1jour", async () => {
      const response = await request(app).get("/prices?type=1jour&age=5");

      const expectedResult = { cost: 0 };
      expect(response.body).toEqual(expectedResult);
    });

    it("for children aged 6 and above till age 15, at 1jour", async () => {
      const response = await request(app).get("/prices?type=1jour&age=6");

      const expectedResult = { cost: 25 };
      expect(response.body).toEqual(expectedResult);
    });

    describe.skip("on Mondays and not a holiday", () => {
      it("for children below the age 6", async () => {
        const response = await request(app).get(
          "/prices?type=1jour&age=5&date=2019-02-11"
        );
        const expectedResult = { cost: 0 };
        expect(response.body).toEqual(expectedResult);
      });

      it("for children aged 6 and above till age 15", async () => {
        const response = await request(app).get(
          "/prices?type=1jour&age=6&date=2019-02-11"
        );
        const expectedResult = { cost: 25 };
        expect(response.body).toEqual(expectedResult);
      });
    });

    describe.skip("on a holiday", () => {
      it("for children below the age 6", async () => {
        const response = await request(app).get(
          "/prices?type=1jour&age=5&date=2019-02-18"
        );
        const expectedResult = { cost: 0 };
        expect(response.body).toEqual(expectedResult);
      });

      it("for children aged 6 and above till age 15", async () => {
        const response = await request(app).get(
          "/prices?type=1jour&age=6&date=2019-02-18"
        );
        const expectedResult = { cost: 25 };
        expect(response.body).toEqual(expectedResult);
      });
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
    it.skip("for folks aged 15 and above, at 1jour", async () => {
      const response = await request(app).get("/prices?type=1jour&age=15");
      const expectedResult = { cost: 35 };
      expect(response.body).toEqual(expectedResult);
    });

    describe("on Mondays and not a holiday", () => {
      it("for folks aged 15 and above", async () => {
        const response = await request(app).get(
          "/prices?type=1jour&age=15&date=2019-02-11"
        );
        const expectedResult = { cost: 23 };
        expect(response.body).toEqual(expectedResult);
      });
    });

    describe("on Mondays and a holiday", () => {
      it("for folks aged 15 and above", async () => {
        const response = await request(app).get(
          "/prices?type=1jour&age=15&date=2019-02-18"
        );
        const expectedResult = { cost: 35 };
        expect(response.body).toEqual(expectedResult);
      });
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

    describe.skip("on Mondays and not a holiday", () => {
      it("for senior folks aged 65 and above", async () => {
        const response = await request(app).get(
          "/prices?type=1jour&age=65&date=2019-02-11"
        );

        const expectedResult = { cost: 18 };
        expect(response.body).toEqual(expectedResult);
      });
    });

    describe.skip("on Mondays and a holiday", () => {
      it("for senior folks aged 65 and above", async () => {
        const response = await request(app).get(
          "/prices?type=1jour&age=65&date=2019-02-18"
        );

        const expectedResult = { cost: 27 };
        expect(response.body).toEqual(expectedResult);
      });
    });
  });
});
