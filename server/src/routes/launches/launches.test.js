const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /v1/launches", () => {
    test("it should respond with 200 status success", async () => {
      await request(app)
        .get("/v1/launches")
        .expect("Content-type", /json/)
        .expect(200);
    });
  });
  describe("Test POST /v1/launches", () => {
    const completeLaunchData = {
      mission: "New UA Mission",
      target: "Kepler-1652 b",
      rocket: "FFED 133 IS",
      launchDate: "January 1, 2031",
    };

    const launchDataWithoutDate = {
      mission: "New UA Mission",
      target: "Kepler-1652 b",
      rocket: "FFED 133 IS",
    };

    const launchDataWithInvalidDate = {
      mission: "New UA Mission",
      target: "Kepler-1652 b",
      rocket: "FFED 133 IS",
      launchDate: "Invalid date",
    };

    test("it should respond with 201 status created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("it should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });
    test("it should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
